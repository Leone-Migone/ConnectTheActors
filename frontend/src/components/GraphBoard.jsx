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
}) {
  const baseNodes = useMemo(() => {
    return nodes.map((node) => ({
      id: `${node.type}-${node.id}`,
      type: "actorMovie",

      // Dagre will replace this initial position.
      position: {
        x: 0,
        y: 0,
      },

      data: {
        name: node.name,
        type: node.type,
        imagePath: node.image_path,
      },
    }));
  }, [nodes]);

  const baseEdges = useMemo(() => {
    return edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: `${edge.from_type}-${edge.from_id}`,
      target: `${edge.to_type}-${edge.to_id}`,
      type: "smoothstep",
    }));
  }, [edges]);

  const layoutedElements = useMemo(() => {
    return getLayoutedElements(
      baseNodes,
      baseEdges
    );
  }, [baseNodes, baseEdges]);

  return (
    <section>
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

function getLayoutedElements(nodes, edges) {
  const dagreGraph =
    new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    // LR means left to right.
    rankdir: "LR",

    // Horizontal distance between graph levels.
    ranksep: 110,

    // Vertical distance between nodes on the same level.
    nodesep: 60,

    marginx: 30,
    marginy: 30,
  });

  for (const node of nodes) {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    dagreGraph.setEdge(
      edge.source,
      edge.target
    );
  }

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const dagrePosition =
      dagreGraph.node(node.id);

    return {
      ...node,

      // Dagre gives the centre of the node.
      // React Flow expects the top-left corner.
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