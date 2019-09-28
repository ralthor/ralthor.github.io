---
layout: post
title:  "Implementing Solution to Multiple Traveling Salesman Problem"
date:   2019-09-28 08:35:53 +0330
categories: AI Genetic
---

Solving Traveling Salesman Problem (TSP) is proven to be unsolvable in polynomial time, therefore lots of heuristic/meta-heuristic algorithms are used to solve that and give near optimal solutions. [This link](https://github.com/parano/GeneticAlgorithm-Solving-TSP) is parano's genetic TSP solution. It is also available online.

I changed parano's solution, to work for Multiple TSP (MTSP), in which there are more than one traveling salesman. It is an [online multiple traveling salesman problem solver](/mtsp). The [source code](https://github.com/ralthor/GeneticAlgorithm-TSP/tree/feature-multi-tsp) is also available.

## Multiple salesmen? It is easy!

<a href="/mtsp"><img src="/images/threeSalesmen.png" /></a>


Two easy steps I took to change the base code from TSP to MTSP solver:

### 1. Added source nodes for each salesman
For TSP, we have only one source node. I added several other source nodes at the same place with the main source.
This way, one of the possible solutions for 10 nodes and two salesmen may be `3 8 4 0 5 7 1 9 0 6 2`. Since the list is rotating, it can be read as `5 7 1 9 0 6 2 3 8 4 0`. Different salesmen's paths are separated with 0, which is the index of the source node.

However, we may end up paths with length 0, for example `1 7 4 8 0 0 3 5 2 9 6`, in which one of the salesmen started from 0 and immediately went to 0.
To avoid this, the distance between source nodes is assumed to be infinity.

### 2. Changed the evaluation method to consider multiple salesman

Previous evaluation method was returning the sum of the distances. In other words, it was calculating the total distance the salesman travelled. In code, it is found like this:
{% highlight javascript %}
return sum;
{% endhighlight %}

In order to maintain all of the salesmen's travelled distances almost the same, I changed above code to this:

{% highlight javascript %}
var L2 = sumForSalesman.reduce((t, x) => t + x*x, 0);
return L2 / sum;
{% endhighlight %}

