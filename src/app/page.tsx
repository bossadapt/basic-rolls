"use client";
import JSXStyle from "styled-jsx/style";
import React from "react";
import { useState } from "react";
import "./page.css";
import { useRouter } from "next/navigation";

export const Starting: React.FC = () => {
  const router = useRouter();
  return (
    <div className="contents">
      <h1>Setup</h1>
      <hr></hr>
      <h2>Imports</h2>
      <button onClick={() => router.push("/importer/excel")}>
        Excel/openDoc
      </button>
      <h2>Manual input</h2>
      <button onClick={() => router.push("/editor")}>Manual Enter</button>
    </div>
  );
};
export default Starting;
