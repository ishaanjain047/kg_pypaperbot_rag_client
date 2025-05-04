import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./components/home/HomePage";
import { SearchPage } from "./components/search/SearchPage";
import { SidebarProvider } from "./context/SidebarContext";
import ResearchAssistant from "./components/query/queryPage";
import UltraSimplifiedResearchAssistant from "./components/query/s_queryPage";
import { VariantSearchPage } from "./components/variant/VariantSearchPage";

const App = () => {
  return (
    <Router>
      <SidebarProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/query"
              element={<UltraSimplifiedResearchAssistant />}
            />
            <Route path="/variant-search" element={<VariantSearchPage />} />
          </Routes>
        </Layout>
      </SidebarProvider>
    </Router>
  );
};

export default App;
