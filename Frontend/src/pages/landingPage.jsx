import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const navigate = useNavigate();

  // 🔁 CONTEXT → REDUX (ONLY CHANGE)
  const { isLoggedin } = useSelector((state) => state.auth);

  useEffect(() => {
    /* Spotlight cursor */
    const spot = document.getElementById("spot");
    const moveSpot = (e) => {
      if (spot) {
        spot.style.left = e.clientX + "px";
        spot.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", moveSpot);

    /* Testimonial slider */
    const cards = document.querySelectorAll(".tcard");
    let i = 0;
    const slider = setInterval(() => {
      if (cards.length === 0) return;
      cards[i].classList.remove("active");
      i = (i + 1) % cards.length;
      cards[i].classList.add("active");
    }, 3500);

    /* Parallax */
    const container = document.getElementById("parallaxContainer");
    if (container) {
      const layers = container.querySelectorAll(".parallax-layer");

      const movePara = (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        layers.forEach((layer) => {
          const depth = layer.dataset.depth;
          const moveX = (x * depth) / 20;
          const moveY = (y * depth) / 20;
          layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      };

      container.addEventListener("mousemove", movePara);
    }

    return () => {
      document.removeEventListener("mousemove", moveSpot);
      clearInterval(slider);
    };
  }, []);

  const handleClick = () => {
    if (isLoggedin) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">
      {/* Internal CSS */}
      <style>{`
        body { font-family: "Inter", sans-serif; }

        .typing::after {
          content: "|";
          animation: blink 0.7s infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
          100% { transform: translateY(0); }
        }
        .float { animation: float 6s ease-in-out infinite; }

        .spotlight {
          position: absolute;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(255,255,255,0.20), transparent 70%);
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: 0.08s ease-out;
          filter: blur(60px);
          opacity: 0.7;
          z-index: 5;
        }

        .tcard {
          opacity: 0;
          transform: scale(.9);
          transition: .6s ease;
        }
        .tcard.active {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CollabX
          </h1>

          <div className="hidden md:flex gap-10 text-gray-300 font-medium">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#testimonials" className="hover:text-white transition">Reviews</a>
            <a href="#about" className="hover:text-white transition">About</a>
          </div>

          <button className="block md:hidden text-3xl">☰</button>
        </div>
      </nav>

      {/* Spotlight */}
      <div id="spot" className="spotlight"></div>

      {/* HERO SECTION */}
      <section className="pt-40 pb-10 relative overflow-hidden">
        <div className="absolute -top-20 -left-32 w-[420px] h-[420px] bg-blue-500/25 rounded-full blur-[150px]"></div>
        <div className="absolute top-10 right-10 w-[380px] h-[380px] bg-purple-500/20 rounded-full blur-[140px]"></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.13),transparent_70%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto pl-14 pr-6 text-center relative z-20">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            The Future of
            <span className="block text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
              Real-Time Collaboration
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Work together with unmatched smoothness. Draw, write, brainstorm,
            ideate — with stunning AI enhancements, live presence, and
            pixel-perfect syncing.
          </p>

          {/* CTA BUTTON */}
          <button
            onClick={handleClick}
            className="mt-10 px-12 py-4 rounded-xl text-lg font-semibold shadow-xl transition 
            bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Start Working
          </button>
          {/* PARALLAX CONTAINER */}
          <div
            id="parallaxContainer"
            className="mt-10 relative mx-auto max-w-4xl h-[380px]"
          >
            {/* Background */}
            <div className="absolute inset-0 parallax-layer" data-depth="0.1">
              <svg viewBox="0 0 1100 400" className="w-full h-full">
                <rect
                  x="40"
                  y="40"
                  width="1020"
                  height="300"
                  rx="22"
                  fill="rgba(255,255,255,0.05)"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="3"
                ></rect>
              </svg>
            </div>

            {/* Curve */}
            <div className="absolute inset-0 parallax-layer" data-depth="0.25">
              <svg viewBox="0 0 1100 400" className="w-full h-full">
                <path
                  d="M140 210 C 270 140, 420 260, 560 180 S 820 230, 980 150"
                  stroke="#60a5fa"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* Handwriting + Text */}
            <div className="absolute inset-0 parallax-layer" data-depth="0.32">
              <svg viewBox="0 0 1100 400" className="w-full h-full">
                <path
                  d="M260 260 q20 -40 40 0 t40 0 t40 0"
                  stroke="#fb7185"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />

                <text
                  x="430"
                  y="268"
                  fill="#ffffff"
                  fontSize="46"
                  fontWeight="600"
                  opacity="0.9"
                  style={{ letterSpacing: "1px" }}
                >
                  hello world
                </text>

                <circle cx="410" cy="245" r="6" fill="#f472b6"></circle>
                <circle cx="425" cy="233" r="4" fill="#e879f9"></circle>
                <circle cx="450" cy="250" r="5" fill="#c084fc"></circle>
              </svg>
            </div>

            {/* Shapes */}
            <div className="absolute inset-0 parallax-layer" data-depth="0.45">
              <svg viewBox="0 0 1100 400" className="w-full h-full">
                <path
                  d="M160 100 L290 105 L300 190 L170 180 Z"
                  stroke="#facc15"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.4"
                />
                <rect
                  x="170"
                  y="110"
                  width="120"
                  height="70"
                  rx="8"
                  fill="#fef9c3"
                  stroke="#facc15"
                  strokeWidth="3"
                />

                <path
                  d="M680 120 m -40 0 a 40 36 0 1 0 80 0 a 40 36 0 1 0 -80 0"
                  stroke="#93c5fd"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.4"
                />
                <circle
                  cx="680"
                  cy="120"
                  r="35"
                  fill="#dbeafe"
                  stroke="#60a5fa"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Pen Tool */}
            <div className="absolute inset-0 parallax-layer" data-depth="0.55">
              <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 
                bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl
                shadow-lg flex items-center justify-center float"
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3l8 8-8 8M3 21l6-6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========= FEATURES SECTION ========= */}
      <section
        id="features"
        className="py-2 bg-gray-950 relative overflow-hidden"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Powerful Features Tailored for Collaboration
          </h2>

          <p className="text-center text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            Everything you need to draw, write, think, organize, generate
            shapes, convert handwriting, and collaborate in real time — powered
            by AI.
          </p>

          <div className="grid md:grid-cols-3 gap-10 mt-20">
            {/* Feature 1 */}
            <div
              className="group p-8 rounded-2xl bg-gray-900 border border-white/10 
              hover:border-blue-500/50 hover:shadow-[0_0_25px_#3b82f633] 
              transition-all duration-300 hover:-translate-y-2"
            >
              <div
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 
                flex items-center justify-center mb-6 group-hover:scale-110 transition"
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2v20M5 9h14M5 15h14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-white">
                Real-Time Everything
              </h3>
              <p className="text-gray-400 mt-3 leading-relaxed">
                Draw, write, erase, edit, and collaborate with live cursors and
                sub-40ms sync.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="group p-8 rounded-2xl bg-gray-900 border border-white/10
              hover:border-purple-500/50 hover:shadow-[0_0_25px_#a855f733]
              transition-all duration-300 hover:-translate-y-2"
            >
              <div
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500
                flex items-center justify-center mb-6 group-hover:scale-110 transition"
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 7h18M7 7v10M17 7v10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-white">
                AI Handwriting → Text
              </h3>
              <p className="text-gray-400 mt-3 leading-relaxed">
                Write naturally with your hand or mouse. AI converts it into
                clean text instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="group p-8 rounded-2xl bg-gray-900 border border-white/10
              hover:border-pink-500/50 hover:shadow-[0_0_25px_#ec489933]
              transition-all duration-300 hover:-translate-y-2"
            >
              <div
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-red-500
                flex items-center justify-center mb-6 group-hover:scale-110 transition"
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="4"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-white">
                AI Shape Generator
              </h3>
              <p className="text-gray-400 mt-3 leading-relaxed">
                Draw rough shapes, boxes, arrows — AI transforms them into
                perfect shapes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-28 bg-gray-950">
        <h2 className="pb-10 text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
          Loved by Teams Everywhere
        </h2>

        <div className="max-w-5xl mx-auto relative">
          {/* CARD 1 */}
          <div className="tcard active absolute inset-0 flex flex-col md:flex-row items-center gap-10 px-8">
            <img
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
              className="w-40 h-40 object-cover rounded-2xl shadow-xl border border-white/10"
            />
            <div className="flex-1 text-left">
              <p className="text-xl text-gray-300 italic leading-relaxed">
                “The collaboration experience feels magical. Real-time drawing
                is super smooth.”
              </p>
              <div className="mt-4 font-semibold text-white text-lg">
                — Mira · Product Designer
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="tcard absolute inset-0 flex flex-col md:flex-row items-center gap-10 px-8">
            <img
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80"
              className="w-40 h-40 object-cover rounded-2xl shadow-xl border border-white/10"
            />
            <div className="flex-1 text-left">
              <p className="text-xl text-gray-300 italic leading-relaxed">
                “The handwriting-to-text feature saves us HOURS every week.”
              </p>
              <div className="mt-4 font-semibold text-white text-lg">
                — Rahul · Developer
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="tcard absolute inset-0 flex flex-col md:flex-row items-center gap-10 px-8">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
              className="w-40 h-40 object-cover rounded-2xl shadow-xl border border-white/10"
            />
            <div className="flex-1 text-left">
              <p className="text-xl text-gray-300 italic leading-relaxed">
                “Our sprint diagrams look production-ready automatically.”
              </p>
              <div className="mt-4 font-semibold text-white text-lg">
                — Olivia · Engineering Manager
              </div>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="tcard absolute inset-0 flex flex-col md:flex-row items-center gap-10 px-8">
            <img
              src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=400&q=80"
              className="w-40 h-40 object-cover rounded-2xl shadow-xl border border-white/10"
            />
            <div className="flex-1 text-left">
              <p className="text-xl text-gray-300 italic leading-relaxed">
                “Perfect for group studies — clean diagrams with zero effort.”
              </p>
              <div className="mt-4 font-semibold text-white text-lg">
                — Aarav · Student
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="py-10 bg-gray-950 border-t border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-20 left-0 w-80 h-80 bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-500/10 blur-[150px]"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <h2
              className="text-4xl md:text-5xl font-extrabold leading-tight 
            bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"
            >
              Built for Real Collaboration,
              <br />
              Powered by AI Intelligence
            </h2>

            <p className="mt-6 text-gray-300 text-lg leading-relaxed">
              CollabX helps creators, students, engineers and teams bring ideas
              to life together. Real-time sync, shape recognition,
              handwriting-to-text and frictionless editing.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">AI-Assisted Creativity</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-400">Lightning-Fast Sync</span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[300px]">
            <svg viewBox="0 0 600 400" className="w-full h-full">
              <rect
                x="60"
                y="50"
                width="480"
                height="300"
                rx="20"
                fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />

              <rect
                x="120"
                y="120"
                width="120"
                height="70"
                rx="10"
                fill="#fef9c310"
                stroke="#facc15"
                strokeWidth="3"
              />

              <circle
                cx="330"
                cy="160"
                r="35"
                fill="#dbeafe20"
                stroke="#60a5fa"
                strokeWidth="3"
              />

              <polygon
                points="420,230 470,160 520,230"
                fill="#86efac20"
                stroke="#22c55e"
                strokeWidth="3"
              />

              <path
                d="M140 230 C 200 190, 260 260, 330 215 S 450 250, 520 200"
                stroke="#60a5fa"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl float"></div>
            <div className="absolute bottom-0 right-0 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl float"></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CollabX
            </h1>
            <p className="text-gray-400 mt-4 text-sm">
              A new era of real-time collaboration. Draw, think, create —
              powered by AI.
            </p>

            <div className="flex gap-4 mt-6">
              <a className="hover:scale-110 transition" href="#">
                <svg width="26" height="26" fill="white"></svg>
              </a>
              <a className="hover:scale-110 transition" href="#">
                <svg width="26" height="26" fill="white"></svg>
              </a>
              <a className="hover:scale-110 transition" href="#">
                <svg width="26" height="26" fill="white"></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="text-gray-400 space-y-3">
              <li>
                <a className="hover:text-white transition" href="#features">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#testimonials">
                  Testimonials
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#about">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="text-gray-400 space-y-3">
              <li>
                <a className="hover:text-white transition" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="text-gray-400 space-y-3">
              <li>Email: support@collabx.com</li>
              <li>Twitter: @collabx</li>
              <li>Location: Remote • Worldwide</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-12">
          © 2025 CollabX. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
