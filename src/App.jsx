import React, { useState, useCallback, useReducer, useEffect } from "react";

const genres = ["Fiction", "Non-Fiction", "Fantasy", "Romance", "Science"];
const moods = {
  Fiction: ["Happy", "Sad", "Thoughtful"],
  "Non-Fiction": ["Inspired", "Curious", "Reflective"],
  Fantasy: ["Adventurous", "Excited", "Mystical"],
  Romance: ["Romantic", "Emotional", "Cheerful"],
  Science: ["Curious", "Focused", "Analytical"],
};

const initialState = {
  loading: false,
  aiResponses: [],
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return {
        ...state,
        loading: false,
        aiResponses: [...state.aiResponses, ...action.payload],
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [level, setLevel] = useState("");

  const [state, dispatch] = useReducer(reducer, initialState);

  const availableMoodBasedOnGenre = moods[genre] || [];

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) {
      alert("Please select all fields!");
      return;
    }

    dispatch({ type: "START" });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const candidates = data?.candidates || [];

      dispatch({ type: "SUCCESS", payload: candidates });
    } catch (err) {
      dispatch({ type: "ERROR", payload: "Failed to fetch recommendations" });
      console.error(err);
    }
  }, [genre, mood, level]);

  useEffect(() => {
    if (state.error) console.log(state.error);
  }, [state.error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4f8",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: "30px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Book Recommendations AI
        </h2>

        {/* Genre Select */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="" disabled>
            Please select a genre
          </option>
          {genres.map((g, i) => (
            <option key={i} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Mood Select */}
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="" disabled>
            Please select a mood
          </option>
          {availableMoodBasedOnGenre.map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Level Select */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="" disabled>
            Please select a level
          </option>
          {["Beginner", "Intermediate", "Expert"].map((lvl, i) => (
            <option key={i} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        {/* Submit Button */}
        <button
          onClick={fetchRecommendations}
          disabled={state.loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4f46e5",
            color: "#fff",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            border: "none",
            marginTop: "10px",
          }}
        >
          {state.loading ? "Fetching..." : "Get Recommendations"}
        </button>

        {/* AI Responses */}
        <div style={{ marginTop: "20px" }}>
          {state.aiResponses.map((recommend, index) => (
            <details
              key={index}
              style={{
                marginBottom: "10px",
                padding: "10px",
                background: "#f1f5f9",
                borderRadius: "8px",
              }}
            >
              <summary style={{ fontWeight: "bold" }}>
                Recommendation {index + 1}
              </summary>
              <p style={{ marginTop: "5px", lineHeight: "1.5" }}>
                {recommend?.content?.[0]?.text || "No content"}
              </p>
            </details>
          ))}
        </div>

        {state.error && (
          <p style={{ color: "red", marginTop: "10px" }}>{state.error}</p>
        )}
      </div>
    </div>
  );
}
