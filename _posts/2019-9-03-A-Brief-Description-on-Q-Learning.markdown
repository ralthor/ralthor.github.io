---
layout: post
title: A brief description on Q-Learning and how it is implemented
date:   2019-09-03 08:35:53 +0330
categories: [AI, ML, Q-Learning, Reinforcement learning]
---

<img src="/images/chess-1403622_960_720.jpg" />

Are you trying to develop a simple AI agent to win a game? Maybe Q-Learning is a right choice for you. Applying Q-Learning, your system will learn based on its previous experiences. It means in order to choose between its possible actions, it should have experienced a similar situation. Base on the environment, that may end up the situation when we leave two (or more?!) of our agents to play against each other and learn (Google DeepMind!), or just put the agent in the world to learn from its experiences!

## Q-Learning story

The learning process in Q-Learning is based on scoring the next possible actions. These are called Q-values. It means looking at the environment during the learning process, the agent scores each of its actions based on its experience. For example, in a maze game, such as PacMan, if some actions lead the agent to win the game, the scores of those actions are boosted to increase their chance to be selected later. On the other hand, if some actions lead to fail, for example running into a ghost, the scores are decreased to avoid selecting them in the future.

## How to set up the Q-Learning process?

<img src="/images/paper-3033204_960_720.jpg" />

The learning environment includes several world states. The agent moves from one state of the world to another by selecting an action. The states can be represented by tables, each contains several cells. For example, in a PacMan game, a ghost stands at a certain cell. For each cell, adjacent cells are available for the agent to choose for its next action. This is where the scores (Q-values) are required. Therefore, there is a score for each next action, say the next cell. These scores are set to a fix value, say zero, at the beginning, because the agent has yet no idea of the outcome of its actions. However, there is a reward/punishment system in Q-Learning method, which effects the scores during the learning process. These rewards and punishments are certain cells, with known scores. For example, the score for the exit cells and ghost cells can be +1 and -1 respectively. The run between the start of the game and when it is finished (or we consider it enough for learning) is called an _episode_. A process of Q-Learning may consist of thousands of episodes or more.

The definitions presented in this step are:

- state of the world (state): a representation of what happen in the world, where the agent is able to see the situation and select its next action. For the agent, the state may be desirable, undesirable or something between these two.
- actions of the agent: actions change the status of the world, and may lead to a desirable/undesirable state. These must be selected _intelligently_, and the learning process makes it possible.
- score or Q-values: The intelligence behind Q-Learning is based on the score it assigns to the pairs of states and actions. In other words, when the agent is in a _state_, and it selects an _action_, the agent wants to know how much score it will gain. This makes it possible for the agent to select the best action for the current state of the world, even if no direct reward/punishment is given at the moment.
- reward and punishment: although at the beginning there is no meaningful score for the most of the world states, if the agent reaches some world states, it is rewarded or punished. Those states are not necessarily the end of the game.
- episode: The run between the start of the game and when it is finished, or when it is decided to apply the scores.
- learning: ending the game (either by loosing or winning, or even falling into a loop which may interpreted as a fail) gives the opportunity to see which states and actions lead the agent to reach the current state. Q-Learning changes the Q-values for all of the path. However, this is a weighted change, which is dependent to both the times the state, action pair is updated and the distance of it to the end of the episode. For example, the tenth update has more effect than the fifteenth, and the adjacent decision to the end of an episode is more effected than the first decision the agent made in that episode.
- state, action pair: it is shown by `(s, a)`. In Q-Learning, a score is assigned to each pair, which is written `Q(s, a)` and read Q-values of performing action `a` in state `s`.

## Exploration vs Exploitation

<img src="/images/sunflower-3752842_960_720.jpg" />

Put the agent at the start cell, and let it takes its first action! At the beginning, because of the unknown scores, its actions are chosen randomly. However, when it reaches its first win/lose cell (reward or punishment cell), the cells in the path will be updated. In order not to take similar actions on the first positive response, or avoid a right path if it is failed somewhere at the end, an exploration mechanism is embedded into the learning phase of the Q-Learning. It means during the game, there is a probability that the agent selects an action except the current best action. This is called the exploration probability. This is decreased during the learning process. It helps the agent to explore the environment at the early stages of the learning process, and to focus on improving its final steps at the end.

## Lets talk formula!

<img src="/images/photo-1505739949791-7ea6e1c5f2c7.jpg" />

Before coding, let's look at the formulas. They help to implement what everyone knows as Q-Learning. This is the learning formula, based on [Wikipedia](https://en.wikipedia.org/wiki/Q-learning):

$$Q^{new}(s_t, a_t) \leftarrow (1-\alpha).Q(s_t, a_t)+\alpha . (r_t + \gamma . max_aQ(s_{t+1}, a))$$

In this calculation:

- $$Q^{new}(s_t, a_t)$$ is the new Q-value (score) for this state, action pair
- $$\alpha$$ is the learning rate, between 0 and 1 (0 means no learning and 1 means dismiss old learnings)
- $$\gamma$$ is the discount value. This is between 0 and 1, and shows how much the score is important. For 0, even final state, actions are considered worthless. For something in between, the calculated score becomes less important as it goes backward from the final score, say end of an episode.
- $$r_t$$ is the reward. It may be zero if the agent has not reached the required state. However, if it has reached, it shall be rewarded!
- $$max_aQ(s_{t+1}, a)$$ is the Q-value for best available action in state _s_.

## Developing the Q-Learning environment

Here is a simplified Javascript code for one episode of the Q-Learning process.

{% highlight javascript %}
let pairs = [];

let s = environment.start();
let a = null;
for (let i = 0; i < maxEpisodeLength && !environment.isFinal(s); i++) {
	let actions = environment.actions(s);
	if (epsilon > Math.random()) // exploration vs exploitation
		a = actions.randomElement(); // explore
	else
		a = selectBest(s, actions); // exploit

    let candidateState = environment.applyAction(s, a)
    if (pairs.map(p => p[0]).findIndex(state => state == candidateState) != -1)
    	continue; // if the state is repeated, it is not selected.

    pairs.push([s, a]);
    s = candidateState;
}
let score = 0;
let reward = 1;
if (environment.isFinal(s)) {
	score = environment.isFinal(s);
	if (score > 0)
		reward = 1.1;
}
else
	score = bestScore(s);

for (let i = pairs.length - 1; i >= 0; i--) {
	let prevScore = pairs[i] in qvalues ? qvalues[pairs[i]] : 0; // retrieve the previous score of this pair, if any.
	qvalues[pairs[i]] = ((1 - alpha) * prevScore + alpha * (reward * discount * score));
	score = qvalues[pairs[i]];
}
{% endhighlight %}

The complete working code is available in [this github repository](https://github.com/ralthor/q-learning-javascript).

### Implementation notes:

- To develop Q-Learning, I make a big loop over all of the episodes I want to have, which could be unlimited.
- Inside that loop, I put the agent in the starting state, and let it react to the environment based on its Q-values.
- When the agent reaches the end of the current episode (either by reaching a final state or the end of its permitted action numbers), I have made a list out of its state, action pairs.
- To avoid loops inside the list of state, action pairs, the actions which create a loop is not selected. It means that the agent waits on that cell to select another action on its next chance.
- Starting from the end of the list, I apply the learning formula to all of the state, action pairs it traversed.
- Instead of adding the reward, I simply multiplied it. It helps not to be aware of reducing it while going backward through the list.

### Online demo:

An online demo is available [here](/qlearning).

<a href="/qlearning"><img src="/images/qlearning.png" /></a>

## What to search/read next?

These topics maybe interesting:

- Q-Learning variations and alternatives
- Different policies for learning
- Deep Q-Learning

## Next post

In the next post, I will implement a Q-Learning powered agent playing a game. I like it to be snake, since I have created the environment [here](https://github.com/ralthor/Snake). However, as the environment gets larger, storing all of the state, action pairs gets harder. Therefore, the next implementation may use Deep Q-Learning!
