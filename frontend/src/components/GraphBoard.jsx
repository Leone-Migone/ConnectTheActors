import { useMemo } from "react";
import dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import ActorMovieNode from "./ActorMovieNode";


const nodeTypes = {
  actorMovie: ActorMovieNode,
};

const NODE_WIDTH = 150;
const NODE_HEIGHT = 270;


function GraphBoard({
  nodes = [],
  edges = [],
  playerPath = [],
  gameStatus = "playing",
}) {
  const gameFinished = gameStatus !== "playing";

  const pathNodeIds = useMemo(() => {
    return new Set(
      playerPath.map(
        (node) => `${node.type}-${node.id}`
      )
    );
  }, [playerPath]);


  const pathEdgeIds = useMemo(() => {
    const pathEdges = new Set();

    for (let i = 0; i < playerPath.length - 1; i++) {
      const current = playerPath[i];
      const next = playerPath[i + 1];

      const currentId =
        `${current.type}-${current.id}`;

      const nextId =
        `${next.type}-${next.id}`;

      pathEdges.add(
        createEdgeKey(currentId, nextId)
      );
    }

    return pathEdges;
  }, [playerPath]);


  const baseNodes = useMemo(() => {
    return nodes.map((node) => {
      const nodeId = `${node.type}-${node.id}`;

      const isInPath =
        pathNodeIds.has(nodeId);

      const isDimmed =
        gameFinished &&
        playerPath.length > 0 &&
        !isInPath;

      return {
        id: nodeId,
        type: "actorMovie",

        position: {
          x: 0,
          y: 0,
        },

        data: {
          name: node.name,
          type: node.type,
          imagePath: node.image_path,
          isInPath,
          isDimmed,
          gameFinished,
        },
      };
    });
  }, [
    nodes,
    pathNodeIds,
    gameFinished,
    playerPath.length,
  ]);


  const baseEdges = useMemo(() => {
    return edges.map((edge, index) => {
      const source =
        `${edge.from_type}-${edge.from_id}`;

      const target =
        `${edge.to_type}-${edge.to_id}`;

      const isInPath = pathEdgeIds.has(
        createEdgeKey(source, target)
      );

      const isDimmed =
        gameFinished &&
        playerPath.length > 0 &&
        !isInPath;

      return {
        id: `edge-${index}`,
        source,
        target,
        type: "smoothstep",

        animated:
          gameFinished && isInPath,

        className: [
          isInPath
            ? "graph-edge--path"
            : "",
          isDimmed
            ? "graph-edge--dimmed"
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      };
    });
  }, [
    edges,
    pathEdgeIds,
    gameFinished,
    playerPath.length,
  ]);


  const layoutedElements = useMemo(
    () =>
      getLayoutedElements(
        baseNodes,
        baseEdges
      ),
    [baseNodes, baseEdges]
  );


  return (
    <section className="graph-section">
      <h2>Your graph</h2>

      <div className="flow-board">
        <ReactFlow
          nodes={layoutedElements.nodes}
          edges={layoutedElements.edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </section>
  );
}


function createEdgeKey(nodeA, nodeB) {
  return [nodeA, nodeB]
    .sort()
    .join("--");
}


function getLayoutedElements(
  nodes,
  edges
) {
  const dagreGraph =
    new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(
    () => ({})
  );

  dagreGraph.setGraph({
    rankdir: "LR",
    ranksep: 110,
    nodesep: 60,
    marginx: 30,
    marginy: 30,
  });


  for (const node of nodes) {
    dagreGraph.setNode(
      node.id,
      {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }
    );
  }


  for (const edge of edges) {
    dagreGraph.setEdge(
      edge.source,
      edge.target
    );
  }


  dagre.layout(dagreGraph);


  const layoutedNodes =
    nodes.map((node) => {
      const dagrePosition =
        dagreGraph.node(node.id);

      return {
        ...node,

        position: {
          x:
            dagrePosition.x -
            NODE_WIDTH / 2,

          y:
            dagrePosition.y -
            NODE_HEIGHT / 2,
        },
      };
    });


  return {
    nodes: layoutedNodes,
    edges,
  };
}


export default GraphBoard;