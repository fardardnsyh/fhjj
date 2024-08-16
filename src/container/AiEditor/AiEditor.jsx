import React, { useEffect, useState } from "react";
import { GiArtificialHive } from "react-icons/gi";
import { FaWindowMinimize } from "react-icons/fa";
import { CgMaximize } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import "./AiEditor.css";
import { getPromptAnswer } from "../../utils/model";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import ACTIONS from "../../Actions";

function AiEditor({ socketRef, roomId }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [usingAI, setUsingAI] = useState(false);
  const [responses, setResponses] = useState([]);
  const [minimized, setMinimized] = useState(true);

  const handleSubmitForm = async (e, click) => {
    e.preventDefault();
    if (e.key == "Enter" || click ) {
      setLoading(true);

      // Combine all previous responses into a single string, including the new prompt
      const conversationHistory = responses
        .map((response) => `User: ${response.question}\nAI: ${response.answer}`)
        .join("\n");

      const fullPrompt = `${conversationHistory}\nUser: ${prompt}\nAI:`;

      try {
        // Get the answer from the AI model using the full prompt including history
        const answer = await getPromptAnswer(fullPrompt);
        setLoading(false);

        // Update the responses state with the new question and answer
        const newResponses = [...responses, { question: prompt, answer }];
        setResponses(newResponses);
        setPrompt("");
      } catch (e) {
        setLoading(false);
        console.error(`An error occurred: ${e.message}`);
      }
    }
  };

  

  return (
    <>
      {!usingAI && (
        <div className="use_ai_btn" onClick={() => setUsingAI(true)}>
          <GiArtificialHive />
        </div>
      )}
      {usingAI && (
        <div
          className={`overlay ${minimized ? "minimized" : ""}`}
        >
          <div className="top_section">
            <h1 className="overlay_heading">AI  Editor</h1>
            <div className="tool_container">
              {!minimized ?
                <div className="minimize tool" onClick={() => setMinimized(true)}><FaWindowMinimize /></div> :
                <div className="maximize tool" onClick={() => setMinimized(false)}><CgMaximize /></div>}

              <div className="cross tool" onClick={() => setUsingAI(false)}>
                <RxCross2 />
              </div>
            </div>
          </div>
          <div className="overlay_response">
            {responses.map((response, key) => (
              <div key={key} className="response">
                <p className="question">{response.question}</p>
                <SyntaxHighlighter language="javascript" style={dracula}>
                  {response.answer}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>
          {loading && (
            <div className="loading-animation">
              {/* Typing animation loader */}
              <div className="typing-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}{" "}
          <form onSubmit={handleSubmitForm}>
            <div className="text__field">
              <textarea
                className="text_input"
                rows="auto"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyUp={handleSubmitForm}
                disabled={loading}
              />
              {/* <input
                type="submit"
                value="ASK"
                className="text_submit"
                disabled={loading}
                onClick={handleSubmitForm}
              /> */}
              <button type="submit" className="text_submit" onClick={(e) => handleSubmitForm(e, true)}>ASK</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default AiEditor;
