function initMatrix() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  const characters =
    "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?";
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(0);

  function draw() {
    ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00FF41";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
  window.addEventListener("resize", resizeCanvas);
}

function showCommonLoader() {
  return new Promise((resolve) => {
    const loader = document.getElementById("commonLoader");
    const progress = document.getElementById("commonLoaderProgress");

    loader.classList.add("active");
    progress.style.width = "0%";

    const progressSteps = [
      { width: "30%", delay: 200 },
      { width: "60%", delay: 300 },
      { width: "90%", delay: 600 },
      { width: "100%", delay: 200 }
    ];

    let totalDelay = 0;
    progressSteps.forEach((step, index) => {
      totalDelay += step.delay;
      setTimeout(() => {
        progress.style.width = step.width;
      }, totalDelay);
    });

    setTimeout(() => {
      loader.classList.remove("active");
      setTimeout(resolve, 0);
    }, totalDelay + 600);
  });
}

class TerminalPortfolio {
  constructor() {
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentInput = document.getElementById("terminalInput");
    this.terminalContent = document.getElementById("terminalContent");
    this.currentInputContainer = document.getElementById("currentInput");
    this.isLoading = false;

    this.commands = {
      "pf -help": () => this.showHelp(),
      "portfolio -help": () => this.showHelp(),
      "pf -about": () => this.showAbout(),
      "portfolio -about": () => this.showAbout(),
      "pf -skills": () => this.showSkills(),
      "portfolio -skills": () => this.showSkills(),
      "pf -projects": () => this.showProjects(),
      "portfolio -projects": () => this.showProjects(),
      "pf -experience": () => this.showExperience(),
      "portfolio -experience": () => this.showExperience(),
      "pf -contact": () => this.showContact(),
      "portfolio -contact": () => this.showContact(),
      "pf -gui": () => this.switchToGUI(),
      "portfolio -gui": () => this.switchToGUI(),
      "ls": () => this.listDirectory(),
      "cd": () => this.changeDirectory(),
      "clear": () => this.clearTerminal(),
      "exit": () => this.showViewSelector(),
    };

    this.initEventListeners();
    this.focusInput();
  }

  initEventListeners() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".terminal-window-controls")) {
        this.focusInput();
      }
    });

    if (this.currentInput) {
      this.currentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autoComplete();
        }
      });
    }

    const closeBtn = document.getElementById("closeTerminal");
    const minimizeBtn = document.getElementById("minimizeTerminal");
    const maximizeBtn = document.getElementById("maximizeTerminal");

    if (closeBtn) {
      closeBtn.addEventListener("click", async () => {
        await showCommonLoader();
        this.showViewSelector();
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        this.addOutput(
          '[INFO] Terminal minimized. Type "exit" to return to selection screen.'
        );
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", () => {
        this.addOutput("[INFO] Terminal maximized.");
      });
    }
  }

  executeCommand() {
    if (this.isLoading || !this.currentInput) return;

    const command = this.currentInput.value.trim();

    if (command) {
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
      this.addOutput(`akhilvvn@portfolio:~$ ${command}`, "command-line");

      if (this.commands[command]) {
        this.commands[command]();
      } else if (command === "cd" || command.startsWith("cd ")) {
        this.changeDirectory(command);
      } else {
        this.addOutput(
          `bash: ${command}: command not found\nType 'pf -help' for available commands.`,
          "error"
        );
      }
    }

    this.clearInput();
    this.createNewPrompt();
  }

  autoComplete() {
    if (!this.currentInput) return;

    const input = this.currentInput.value;
    const commands = Object.keys(this.commands);
    const matches = commands.filter((cmd) =>
      cmd.startsWith(input.toLowerCase())
    );

    if (matches.length === 1) {
      this.currentInput.value = matches[0];
    } else if (matches.length > 1) {
      this.addOutput(matches.join("    "));
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0 || !this.currentInput) return;

    this.historyIndex = Math.max(
      0,
      Math.min(this.commandHistory.length, this.historyIndex + direction)
    );

    if (
      this.historyIndex >= 0 &&
      this.historyIndex < this.commandHistory.length
    ) {
      this.currentInput.value = this.commandHistory[this.historyIndex];
    } else {
      this.currentInput.value = "";
    }
  }

  showHelp() {
    const helpContent = `Available Commands:

You can use pf as a shorthand for the portfolio command
Examples:

pf -help       - Show this help menu
pf -about      - Learn about me
pf -skills     - View my technical skills
pf -projects   - See my projects
pf -experience - View my experience & internships
pf -contact    - Get my contact information
pf -gui        - Switch to GUI mode
ls             - List directory contents
cd             - Change directory
clear          - Clear terminal
exit           - Return to mode selection`;
    this.addOutput(helpContent);
  }

  showAbout() {
    const aboutAscii = ` 
 █████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
███████║██████╔╝██║   ██║██║   ██║   ██║   
██╔══██║██╔══██╗██║   ██║██║   ██║   ██║   
██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   `;

    const aboutContent = `${aboutAscii}

Akhil V Nair - AI/ML Engineer & Cybersecurity Specialist

Building intelligent AI solutions for cybersecurity with expertise in threat detection, computer vision, and explainable AI. Creating secure, privacy-focused machine learning systems for real-world security applications.

I am an AI/ML Engineer specializing in Cybersecurity with a unique background in Criminology and Police Administration. This distinctive combination allows me to approach security challenges from both technical and investigative perspectives, building AI-powered solutions that address real-world threats.

As the HAC'KP 2025 Winner, I built the age estimation module for a dark web takedown platform, enhancing law enforcement capabilities with computer vision models optimized for real-time operational environments. My work focuses on security-focused AI applications including threat detection systems, forensics tools, and privacy-preserving machine learning.

My technical expertise spans explainable AI, generative models, and full-stack development, enabling me to create end-to-end ML pipelines that are not just functional but fundamentally secure by design.

Stats:
- 08+ Projects Completed
- 05+ Professional Certifications
- 01 Hackathon Win (HAC'KP 2025)`;
    this.addOutput(aboutContent);
  }

  showSkills() {
    const skillsAscii = `
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝`;

    const skillsContent = `${skillsAscii}

Technical Skills:

AI/ML & Deep Learning:
█████████████████████     85% TensorFlow/PyTorch
████████████████████      80% Computer Vision
███████████████           75% Scikit-learn/XGBoost
██████████████            70% Model Deployment

Programming & Development:
██████████████████████    90% Python
███████████████           75% JavaScript/React
██████████████            70% FastAPI/Flask
█████████████             65% SQL/Databases

Tools & Frameworks:
█████████████████████     85% Linux/Jupyter
████████████████████      80% Git/Docker
███████████████           75% Hugging Face/OpenCV
██████████████            70% Google Cloud Platform`;
    this.addOutput(skillsContent);
  }

  showProjects() {
    const projectsAscii = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗███████╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝██╔════╝
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   ███████╗
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   ╚════██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   ███████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝`;

    const projectsContent = `${projectsAscii}

Featured Projects:

1. CyPrompt - AI-Driven Security Platform
- Built hybrid ML system with XGBoost and Autoencoders
- Implemented 5-stage Google Gemini pipeline with SHAP explainability
- Real-time threat detection with sub-3s WebSocket latency
- Interactive visualizations for security analysis
➤ Technologies: Python, XGBoost, TensorFlow, Google Gemini, FastAPI, WebSocket, SHAP
➤ GitHub: https://github.com/akhilvvn

2. AI Image Forensics & Investigative Tool Suite
- Developed 8-tool AI/ML suite for comprehensive image analysis
- Perceptual hashing, ResNet scene classification, CLIP multimodal retrieval
- YOLOv8 object detection with FastAPI + React investigator tool
- Built for forensic investigations and security applications
➤ Technologies: Python, ResNet, CLIP, YOLOv8, FastAPI, React, Computer Vision
➤ GitHub: https://github.com/akhilvvn

3. Employee Salary Prediction with Explainable AI
- Random Forest model with SHAP explainability
- Gender fairness analysis and bias detection
- Interactive Streamlit deployment with live predictions
- Feature impact analysis for transparent decision-making
➤ Technologies: Python, Random Forest, SHAP, Streamlit, Scikit-learn, Pandas
➤ GitHub: https://github.com/akhilvvn

4. Privacy-Focused Real-Time Age Estimation
- Client-side age estimation using faceapi.js and TensorFlow.js
- On-device inference for maximum privacy protection
- Optimized lightweight models for low-latency predictions
- Production-ready browser-based inference
➤ Technologies: TensorFlow.js, faceapi.js, JavaScript, Computer Vision
➤ GitHub: https://github.com/akhilvvn`;
    this.addOutput(projectsContent);
  }

  showExperience() {
    const experienceAscii = `
███████╗██╗  ██╗██████╗ ███████╗██████╗ ██╗███████╗███╗   ██╗ ██████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔════╝██╔══██╗██║██╔════╝████╗  ██║██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝█████╗  ██████╔╝██║█████╗  ██╔██╗ ██║██║     █████╗  
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══╝  ██╔══██╗██║██╔══╝  ██║╚██╗██║██║     ██╔══╝  
███████╗██╔╝ ██╗██║     ███████╗██║  ██║██║███████╗██║ ╚████║╚██████╗███████╗
╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝╚══════╝`;

    const experienceContent = `${experienceAscii}

Professional Experience:

1. HAC'KP 2025 Winner - AI Team Member
   Kerala Police Cyberdome
   
   • Built age estimation module for the take it down platform
   • Enhanced Grapnel dark web crawler into real-time solution
   • Deployed CV models: NSFW classification, caption generation, pose estimation
   • Optimized models for real-time performance in operational environments
   ➤ Tech: Python, TensorFlow, Computer Vision, Deep Learning, Real-time Systems

2. Artificial Intelligence & Machine Learning Intern
   Edunet Foundation (AICTE & IBM SkillsBuild) • June 2025 – July 2025
   
   • Hands-on experience in supervised/unsupervised learning
   • Built Employee Salary Prediction model with complete ML pipeline
   • Achieved strong performance metrics through hyperparameter tuning
   • Data preprocessing to deployment workflow
   ➤ Tech: Python, Scikit-learn, TensorFlow, Feature Engineering

Certifications:
✓ Artificial Intelligence - IBM SkillsBuild, 2025
✓ Cybersecurity Fundamentals - IBM SkillsBuild, 2025
✓ Introduction to Cybersecurity - CISCO, 2025
✓ Cloud Computing - NPTEL - IIT Kharagpur, 2025
✓ Programming in C++ - C-DIT - Genisys Academy, 2016`;
    this.addOutput(experienceContent);
  }

  showContact() {
    const contactAscii = `
 ██████╗ ██████╗ ███╗   ██╗████████╗ █████╗  ██████╗████████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║   ██║   ███████║██║        ██║   
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██║██║        ██║   
╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╗   ██║   
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝   `;

    const contactContent = `${contactAscii}

Contact Information:

Email:        akhilvvnair@gmail.com
Phone:        +91 9526532426
Location:     Thiruvananthapuram, Kerala, India
Availability: Currently available for AI/ML and cybersecurity internships,
              full-time roles, research collaborations, and freelance projects

Social:
- GitHub:     github.com/akhilvvn
- LinkedIn:   linkedin.com/in/akhilvvn

Let's collaborate on building intelligent, secure AI solutions 
for real-world cybersecurity challenges.`;
    this.addOutput(contactContent);
  }

  listDirectory() {
    const listDirectory = `Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos`;
    this.addOutput(listDirectory);
  }

  changeDirectory(command) {
    this.addOutput(
      `bash: ${command}: Permission denied\nType 'pf -help' for available commands.`,
      "error"
    );
  }

  async switchToGUI() {
    this.isLoading = true;
    this.addOutput("[INFO] Switching to GUI mode...");

    await showCommonLoader();
    document.getElementById("terminalInterface").style.display = "none";
    document.getElementById("guiInterface").style.display = "block";
    initGUI();
    this.isLoading = false;
  }

  async showViewSelector() {
    this.isLoading = true;
    this.addOutput("[INFO] Returning to mode selection...");

    await showCommonLoader();
    document.getElementById("terminalInterface").style.display = "none";
    document.getElementById("viewSelector").style.display = "flex";
    this.isLoading = false;
  }

  clearTerminal() {
    const outputs = this.terminalContent.querySelectorAll(".terminal-output");
    outputs.forEach((output, index) => {
      if (index > 0) output.remove();
    });
  }

  addOutput(content, type = "") {
    const output = document.createElement("div");
    output.className = `terminal-output ${type}`;
    output.style.whiteSpace = "pre-wrap";

    if (
      content.includes("██") ||
      content.includes("➤") ||
      content.includes("████")
    ) {
      output.innerHTML = `<div class="ascii-art">${content}</div>`;
    } else {
      output.textContent = content;
    }

    this.terminalContent.insertBefore(output, this.currentInputContainer);
    this.scrollToBottom();
  }

  clearInput() {
    if (this.currentInput) {
      this.currentInput.value = "";
    }
  }

  createNewPrompt() {
    const newInputContainer = document.createElement("div");
    newInputContainer.className = "terminal-input-container";
    newInputContainer.id = "currentInput";
    newInputContainer.innerHTML = `
              <span class="terminal-prompt">akhilvvn@portfolio:~$</span>
              <input type="text" class="terminal-input" autocomplete="off" spellcheck="false">
              <span class="terminal-cursor"></span>
            `;

    this.terminalContent.replaceChild(
      newInputContainer,
      this.currentInputContainer
    );
    this.currentInputContainer = newInputContainer;
    this.currentInput = newInputContainer.querySelector(".terminal-input");

    if (this.currentInput) {
      this.currentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autoComplete();
        }
      });
    }

    this.focusInput();
    this.scrollToBottom();
  }

  focusInput() {
    if (this.currentInput) {
      this.currentInput.focus();
    }
  }

  scrollToBottom() {
    this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
  }
}

function initGUI() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks) {
        navLinks.classList.remove("active");
        if (hamburger) {
          hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });

  const switchToTerminalBtn = document.getElementById("switchToTerminal");
  if (switchToTerminalBtn) {
    switchToTerminalBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      await showCommonLoader();

      document.getElementById("guiInterface").style.display = "none";
      document.getElementById("terminalInterface").style.display = "flex";

      if (!window.terminal) {
        window.terminal = new TerminalPortfolio();
      }
      window.terminal.focusInput();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        if (navLinks && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          if (hamburger) {
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
          }
        }
      }
    });
  });

  function animateSkillBars() {
    const skillLevels = document.querySelectorAll(".skill-level");
    skillLevels.forEach((skill) => {
      const level = skill.getAttribute("data-level");
      skill.style.width = level + "%";
    });
  }

  function initTypingAnimation() {
    const textElement = document.getElementById("typed-text");
    if (!textElement) return;

    const texts = [
      "AI/ML Engineer",
      "Cybersecurity Researcher",
      "Full-Stack Developer",
      "Computer Vision Specialist"
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentText = texts[textIndex];

      if (isDeleting) {
        textElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        textElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 1000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
  }

  function initAnimations() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
      });
    }

    animateSkillBars();
    initTypingAnimation();
    window.addEventListener("scroll", highlightNavSection);
    highlightNavSection();
  }

  function highlightNavSection() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    let currentSection = "";
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  (function () {
    emailjs.init("cqGh21Qh0qZrl7DbL");
  })();

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector(".submit-btn");
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      emailjs.sendForm("service_e8y7504", "template_g5pmoju", this)
        .then(() => {
          alert("✅ Message sent successfully!");
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        })
        .catch((error) => {
          alert("❌ Failed to send message. Please try again later.");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  initAnimations();
}

document.addEventListener("DOMContentLoaded", () => {
  initMatrix();

  const terminalOption = document.getElementById("terminalOption");
  const guiOption = document.getElementById("guiOption");

  if (terminalOption) {
    terminalOption.addEventListener("click", async function () {
      document.getElementById("viewSelector").style.display = "none";

      await showCommonLoader();

      document.getElementById("terminalInterface").style.display = "flex";
      if (!window.terminal) {
        window.terminal = new TerminalPortfolio();
      }
      window.terminal.focusInput();
    });
  }

  if (guiOption) {
    guiOption.addEventListener("click", async function () {
      document.getElementById("viewSelector").style.display = "none";

      await showCommonLoader();

      document.getElementById("guiInterface").style.display = "block";
      initGUI();
    });
  }
});
