/**
 * Este script contém as duas pesquisas realizadas
 */

var SearchType = {
  GREEDY_BEST: "greedyBest",
  A_STAR: "aStar",
};

function search(opt_options) {
  var options = _.assign(
    {
      node: null,
      frontierList: [],
      expandedNodes: {},
      iteration: 0,
      iterationLimit: 1000,
      depthLimit: 0,
      expandCheckOptimization: false,
      callback: function () {},
      stepCallback: null,
      type: SearchType.BREADTH_FIRST,
      maxFrontierListLength: 0,
      maxExpandedNodesLength: 0,
      iterativeDeepeningIndex: 0,
    },
    opt_options || {}
  );

  Board.draw(options.node.state);

  if (options.node.game.isFinished()) {
    return options.callback(null, options);
  }

  // Expandir nó atual
  var expandedList = options.node.expand();
  options.expandedNodes[options.node.state] = options.node;
  options.maxExpandedNodesLength = Math.max(
    options.maxExpandedNodesLength,
    _.size(options.expandedNodes)
  );

  // Filtrar nós recém expandidos
  var expandedUnexploredList = expandedList.filter(function (node) {
    // Checar profundidade
    if (options.depthLimit && node.depth > options.depthLimit) return false;

    // Check se nó já foi expandido (com custo menor)
    var alreadyExpandedNode = options.expandedNodes[node.state];
    if (alreadyExpandedNode && alreadyExpandedNode.cost <= node.cost)
      return false;

    // Checar se há uma alternativa melhor (menos custosa) na lista de fronteiras
    var alternativeNode = _.find(options.frontierList, { state: node.state });
    if (alternativeNode && alternativeNode.cost <= node.cost) return false;
    else if (alternativeNode && alternativeNode.cost > node.cost) {
      _.remove(options.frontierList, alternativeNode);
    }

    return true;
  });

  // Adicionar nós recém expandidos e filtrados à lista de fronteiras
  options.frontierList = options.frontierList.concat(expandedUnexploredList);
  options.maxFrontierListLength = Math.max(
    options.maxFrontierListLength,
    options.frontierList.length
  );

  // Checar se o estado desejado está na lista recém expandida
  if (options.expandCheckOptimization) {
    var desiredNode = _.find(expandedUnexploredList, function (unexploredNode) {
      return unexploredNode.game.isFinished();
    });

    if (desiredNode) {
      return options.callback(
        null,
        _.assign({}, options, { node: desiredNode })
      );
    }
  }

  // Próxima chamada
  var nextNode = getNextNode(options);
  if (!nextNode) {
    return options.callback(new Error("Frontier list is empty"), options);
  }

  // Checar iteração
  options.iteration++;
  if (options.iterationLimit && options.iteration > options.iterationLimit) {
    return options.callback(new Error("Iteration limit reached"), options);
  }

  if (window.searchStopped) {
    window.searchStopped = false;
    return options.callback(new Error("Search stopped"), options);
  }

  if (options.stepCallback) {
    options.stepCallback(_.assign(options, { node: nextNode }));
  } else {
    setTimeout(function () {
      search(_.assign(options, { node: nextNode }));
    }, 0);
  }
}

function getNextNode(options) {
  switch (options.type) {
    case SearchType.GREEDY_BEST:
      // Busca Gulosa: calcula apenas custo futuro
      var bestNode = _.minBy(options.frontierList, function (node) {
        return node.game.getManhattanDistance();
      });

      _.remove(options.frontierList, bestNode);

      return bestNode;
    case SearchType.A_STAR:
      //A*: calcula custo futuro e passado
      var bestNode = _.minBy(options.frontierList, function (node) {
        return node.game.getManhattanDistance() + node.cost;
      });

      _.remove(options.frontierList, bestNode);

      return bestNode;
    default:
      throw new Error("Unsupported search type");
  }
}
