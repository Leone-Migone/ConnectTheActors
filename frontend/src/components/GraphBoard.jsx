import { useMemo } from "react";
import "@xyflow/react/dist/style.css";

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

function GraphBoard({
  nodes = [],
  edges = [],
  startActorId,
}) {
  const reactFlowNodes = useMemo(() => {
    return buildFlowNodes(nodes, edges, startActorId);
  }, [nodes, edges, startActorId]);

  const reactFlowEdges = useMemo(() => {
    return edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: `${edge.from_type}-${edge.from_id}`,
      target: `${edge.to_type}-${edge.to_id}`,
      type: "smoothstep",
    }));
  }, [edges]);

  return (
    <section>
      <h2>Your graph</h2>

      <div className="flow-board">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          nodeTypes={nodeTypes}
          fitView
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

function buildFlowNodes(nodes, edges, startActorId) {
  const levels = calculateNodeLevels(
    nodes,
    edges,
    startActorId
  );

  const nodesByLevel = new Map();

  for (const node of nodes) {
    const nodeKey = `${node.type}-${node.id}`;
    const level = levels.get(nodeKey) ?? 0;

    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }

    nodesByLevel.get(level).push(node);
  }

  const flowNodes = [];

  for (const [level, levelNodes] of nodesByLevel) {
    levelNodes.forEach((node, rowIndex) => {
      flowNodes.push({
        id: `${node.type}-${node.id}`,
        type: "actorMovie",
        position: {
          x: level * 260,
          y: rowIndex * 300,
        },
        data: {
          name: node.name,
          type: node.type,
          imagePath: node.image_path,
        },
      });
    });
  }

  return flowNodes;
}

function calculateNodeLevels(
  nodes,
  edges,
  startActorId
) {
  const adjacencyList = new Map();

  for (const node of nodes) {
    adjacencyList.set(`${node.type}-${node.id}`, []);
  }

  for (const edge of edges) {
    const fromKey =
      `${edge.from_type}-${edge.from_id}`;

    const toKey =
      `${edge.to_type}-${edge.to_id}`;

    adjacencyList.get(fromKey)?.push(toKey);
    adjacencyList.get(toKey)?.push(fromKey);
  }

  const startKey = `actor-${startActorId}`;
  const levels = new Map([[startKey, 0]]);
  const queue = [startKey];

  while (queue.length > 0) {
    const currentKey = queue.shift();
    const currentLevel = levels.get(currentKey);

    for (
      const neighbourKey of adjacencyList.get(currentKey) ?? []
    ) {
      if (levels.has(neighbourKey)) {
        continue;
      }

      levels.set(neighbourKey, currentLevel + 1);
      queue.push(neighbourKey);
    }
  }

  return levels;
}

export default GraphBoard;