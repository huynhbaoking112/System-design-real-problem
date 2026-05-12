const tocLinks = document.querySelectorAll(".toc a");

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

setActiveTocLink();
window.addEventListener("scroll", setActiveTocLink, { passive: true });
