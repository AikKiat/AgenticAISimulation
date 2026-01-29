import os
import json
from typing import Dict, Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph
from langgraph.graph import START, END
from langchain_core.messages import HumanMessage, SystemMessage


from prompts import Prompts
from agent_state import AgentState, AgentStep
from ipc import step_simulator, reset_simulator, get_simulator_state

from constants import SimulatorAction

from dotenv import load_dotenv


SIMULATOR_URL = os.environ.get("SIMULATOR_URL", "http://localhost:4000")


load_dotenv()


def summarize_state_for_llm(state: Dict) -> str:
    lines = [
        f"Day {state['day']} / 30",
        "Countries:",
    ]

    countries : dict = state["countries"]
    for country_id, country in countries.items():
        lines.append(
            f"- {country['id']} ({country['name']}): "
            f"welfare={country['welfare']:.1f}, "
            f"food={country['foodInsecurity']}, "
            f"health={country['healthCrisis']}, "
            f"conflict={country['conflict']}, "
            f"infra={country['infraDecay']}"
        )

        danger = []
        if country['welfare'] < 15:
            danger.append("LOW WELFARE")
        if country['healthCrisis'] >= 60:
            danger.append("SEVERE HEALTH")
        if country['foodInsecurity'] >= 60:
            danger.append("SEVERE FOOD")
        lines.append("Dangers this country is current facing: \n")
        lines.append("-".join(d for d in danger))

    if state.get("reason"):
        lines.append(f"Reason: {state['reason']}")
    gift = state.get("currentGift") or {}
    if gift.get("aid_type"):
        lines.append("")
        lines.append(f"Today's available gift (fixed aid type): {gift['aid_type']}")
        lines.append("You cannot change this aid type, only choose which country receives it.")
    return "\n".join(lines)


def build_llm():
    return ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.2,
            streaming=True
        )


def decide_action(state: AgentState) -> AgentState:
    llm = build_llm()

    sim_state = get_simulator_state()
    state_summary = summarize_state_for_llm(sim_state)

    current_gift = (sim_state.get("currentGift") or {}).get("aid_type", "")

    print(state_summary)

    human_message = {
        "State_summary" : state_summary,
        "Strategy_notes" : state['strategy_notes']
    }

    response = llm.invoke([
        SystemMessage(content=Prompts.AI_DECISION_PROMPT),
        HumanMessage(content=json.dumps(human_message))
    ]
    )

    content = response.content
    parsed = json.loads(content)

    target_country_id = parsed["target_country_id"]

    action: SimulatorAction = {
        "target_country_id": target_country_id,
        "aid_type": current_gift,
    }

    rationale = parsed["rationale"]
    past_choices_analysis = parsed["past_choices_analysis"]

    sim_next = step_simulator(action=action, rationale=rationale, past_choices_analysis=past_choices_analysis)
    print("sim next", sim_next)
    outcome_reason = sim_next["reason"]

    #Construct the next step already.
    new_step: AgentStep = {
        "day": sim_next["day"],
        "state_summary": summarize_state_for_llm(sim_next),
        "action": action,
        "outcome_reason": outcome_reason,
    }

    new_steps = state["steps"] + [new_step]
    updated_notes = state["strategy_notes"]


    if rationale:
        updated_notes += f"\nDay {sim_next['day']} decision: {rationale}"

    updated_notes += f"\nDay {sim_next['day']} outcome: {outcome_reason}"

    return {
        "day": sim_next["day"],
        "episode_id": sim_next["episodeId"],
        "steps": new_steps,
        "strategy_notes": updated_notes,
    }


def should_continue(state: AgentState) -> Literal["continue", "done"]:
    sim_state = get_simulator_state()
    if sim_state.get("done"):
        return "done"
    return "continue"




def build_agent():
    graph = StateGraph(AgentState)
    graph.add_node("decide_and_step", decide_action)
    graph.set_entry_point("decide_and_step")
    graph.add_conditional_edges(
        "decide_and_step",
        should_continue,
        {
            "continue": "decide_and_step",
            "done": END,
        },
    )
    return graph.compile().with_config({"recursion_limit":200})


def run_episode() -> AgentState:
    sim_state = reset_simulator()
    
    initial: AgentState = {
        "day": sim_state["day"],
        "episode_id": sim_state["episodeId"],
        "steps": [],
        "strategy_notes": "",
    }

    agent = build_agent()
    final_state = agent.invoke(initial)
    return final_state





if __name__ == "__main__":
    print("Agent started...")
    final = run_episode()
    print("Episode finished.")
    print(f"Episode ID: {final['episode_id']}")
    print(f"Days played: {final['day']}")
    print("Steps:")
    for step in final["steps"]:
        print(f"- Day {step['day']}: {step['action']} -> {step['outcome_reason']}")
