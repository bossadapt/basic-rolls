"use client";
import JSXStyle from "styled-jsx/style";
import React from "react";
import { useState } from "react";
import "./page.css";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/navigation";
export const Starting: React.FC = () => {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const [submitDisabled, setSubmitDisabled] = useState(false);
  async function scrapeGoogleSheet() {
    if (url.indexOf("https://docs.google.com/spreadsheets/") != -1) {
      console.log("url attempted to grab:" + url);
      setSubmitDisabled(true);
      invoke<string>("grab_url", { url: url })
        .then(() => {
          console.log("finished grab");
          setSubmitDisabled(false);
        })
        .catch(console.error);
    } else {
      console.log("bad url");
    }
  }
  return (
    <div className="contents">
      <h1>Setup</h1>
      <hr></hr>
      <h2>Imports</h2>
      <h3>Enter the google sheet</h3>
      <input type="text" id="url" onChange={(e) => setUrl(e.target.value)} />
      <button disabled={submitDisabled} onClick={() => scrapeGoogleSheet()}>
        Retrieve data
      </button>
      <h2>Manual input</h2>
      <button disabled={submitDisabled} onClick={() => router.push("/editor")}>
        Manual Enter
      </button>
    </div>
  );
};
export default Starting;
