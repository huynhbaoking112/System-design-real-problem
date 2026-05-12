const lessons = [
  {
    title: "Design Comment System",
    status: "Completed",
    difficulty: "Medium",
    href: "lessons/design-comment-system/index.html",
    description:
      "A scalable comment system with authentication, nested replies, upvotes/downvotes, moderation, cache, sharding, replication, and peak traffic handling.",
    tags: ["API Design", "MongoDB", "Redis", "Sharding", "Rate Limiting"],
  },
];

const lessonGrid = document.querySelector("#lesson-grid");
const lessonCount = document.querySelector("#lesson-count");
const searchInput = document.querySelector("#search-input");

function renderLessons(items) {
  lessonGrid.innerHTML = items
    .map(
      (lesson) => `
        <article class="lesson-card">
          <div class="lesson-topline">
            <span class="status">${lesson.status}</span>
            <span class="difficulty">${lesson.difficulty}</span>
          </div>
          <h3>${lesson.title}</h3>
          <p>${lesson.description}</p>
          <div class="tag-list">
            ${lesson.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <a class="card-action" href="${lesson.href}">View lesson</a>
        </article>
      `,
    )
    .join("");
}

function filterLessons(value) {
  const keyword = value.trim().toLowerCase();

  if (!keyword) {
    renderLessons(lessons);
    return;
  }

  const filtered = lessons.filter((lesson) => {
    const searchable = [lesson.title, lesson.description, lesson.status, lesson.difficulty, ...lesson.tags]
      .join(" ")
      .toLowerCase();

    return searchable.includes(keyword);
  });

  renderLessons(filtered);
}

lessonCount.textContent = lessons.length;
renderLessons(lessons);
searchInput.addEventListener("input", (event) => filterLessons(event.target.value));
