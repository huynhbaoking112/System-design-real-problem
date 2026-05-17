const tocLinks = document.querySelectorAll(".toc a");
const scrollProgress = document.querySelector(".scroll-progress");

function setActiveTocLink() {
  let activeSectionId = null;

  tocLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));

    if (section && section.getBoundingClientRect().top < 160) {
      activeSectionId = section.id;
    }
  });

  if (!activeSectionId) return;

  tocLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeSectionId}`);
  });
}

function setScrollProgress() {
  if (!scrollProgress) return;

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
}

function syncPageState() {
  setActiveTocLink();
  setScrollProgress();
}

syncPageState();
window.addEventListener("scroll", syncPageState, { passive: true });
window.addEventListener("resize", setScrollProgress);
