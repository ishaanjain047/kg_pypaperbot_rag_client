import React from "react";
import { FeatureCard } from "./FeatureCard";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import HelloTest from "./HelloTest"; // Import the new component

export const HomePage = () => {
  const features = [
    {
      title: "Knowledge Graphs",
      description:
        "We utilize comprehensive biomedical knowledge graphs to map complex relationships between diseases, drugs, and biological mechanisms.",
      className: "bg-blue-50",
    },
    {
      title: "AI-Powered Analysis",
      description:
        "Advanced AI algorithms analyze these relationships to identify promising drug repurposing candidates with high accuracy.",
      className: "bg-purple-50",
    },
    {
      title: "Comprehensive Data Sources",
      description:
        "Our system integrates data from authoritative sources including PubMed and ClinicalTrials.gov, ensuring comprehensive coverage of medical research and clinical evidence.",
      className: "bg-green-50",
    },
    {
      title: "GraphRAG",
      description:
        "Our advanced Graph Retrieval-Augmented Generation system combines graph-based knowledge representation with state-of-the-art language models for more accurate and contextual drug repurposing predictions.",
      className: "bg-indigo-50",
    },
    {
      title: "TXGNN",
      description:
        "Transformer-enhanced Graph Neural Networks enable deep analysis of molecular structures and interactions, improving our ability to predict drug efficacy and potential side effects.",
      className: "bg-rose-50",
    },
    {
      title: "Multishot Prompting",
      description:
        "We leverage sophisticated multishot prompting techniques to enhance our AI models' understanding of complex biomedical relationships and improve prediction accuracy across diverse use cases.",
      className: "bg-amber-50",
    },
  ];

  return (
    <div className="w-full px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to Renaiscent Bionexus
      </h1>
      {/* Add the HelloTest component at the top */}
      <HelloTest />
      <Card>
        <CardHeader>
          <CardTitle>Revolutionizing Drug Discovery Through AI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed mb-8">
            Our cutting-edge platform leverages the power of Knowledge Graphs
            and Artificial Intelligence to identify novel applications for
            existing drugs. By analyzing complex biomedical relationships and
            patterns, we help researchers and healthcare professionals discover
            new therapeutic possibilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                className={feature.className}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
