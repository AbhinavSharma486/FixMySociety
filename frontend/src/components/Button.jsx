import React, { useEffect, useRef } from "react";

const ButtonComponent = ({ buttonText }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      let angle = 0;
      let animationFrameId;

      const animateWaveGradient = () => {
        angle += 1; // Adjust for medium speed
        const gradient = `linear-gradient(${angle}deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)`;
        button.style.background = gradient;
        animationFrameId = requestAnimationFrame(animateWaveGradient);
      };

      animateWaveGradient(); // Start animation immediately

      return () => cancelAnimationFrame(animationFrameId); // Cleanup
    }
  }, []);

  return (
    <div>
      <button
        type="submit"
        ref={buttonRef}
        style={{
          width: "100%",
          height: "50px",
          marginTop: "10px",
          borderRadius: "180px",
          position: "relative",
          background:
            "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
          cursor: "pointer",
          border: "none",
          outline: "none",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "80%",
            height: "70%",
            top: "15%",
            left: "10%",
            transition: "opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
            filter: "blur(15px)",
            opacity: 0,
            background:
              "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
            zIndex: 1,
          }}
          className="hover:opacity-100 hover:filter-blur-25px"
        />

        <div
          style={{
            position: "absolute",
            width: "98%",
            height: "90%",
            top: "4%",
            left: "1%",
            borderRadius: "180px",
            backgroundColor: "rgb(19, 20, 22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <span
            style={{
              color: "rgba(235,235,235,1)",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            {buttonText}
          </span>
        </div>
      </button>
    </div>
  );
};

export default ButtonComponent;