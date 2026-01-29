

from typing_extensions import TypedDict, List
from constants import SimulatorAction

class AgentStep(TypedDict):
    day: int
    state_summary: str
    action: SimulatorAction
    outcome_reason: str


class AgentState(TypedDict):
    day: int
    episode_id: str
    steps: List[AgentStep]
    strategy_notes: str