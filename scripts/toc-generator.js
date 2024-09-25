document.addEventListener("DOMContentLoaded", function() {
    const tocContainer = document.querySelector(".table-of-content");
    if (!tocContainer) return;  // Exit if .table-of-content is not found

    const tocWrapper = document.createElement("div");
    tocWrapper.id = "toc";
    tocWrapper.innerHTML = `
        <h2>Table of Contents <span>▼</span></h2>
    `;

    const tocList = document.createElement("ul");
    tocList.classList.add("toc-list");

    const postBody = document.querySelector(".post-body.entry-content");
    if (!postBody) return;  // Exit if .post-body.entry-content is not found

    const headings = postBody.querySelectorAll("h1, h2, h3");  // Skip h4, h5, h6

    headings.forEach((heading, index) => {
        const listItem = document.createElement("li");
        listItem.style.marginLeft = `${(parseInt(heading.tagName[1]) - 1) * 20}px`;  // Indent for h2, h3
        const link = document.createElement("a");
        const id = `toc-heading-${index}`;
        heading.id = id;
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    tocWrapper.appendChild(tocList);
    tocContainer.appendChild(tocWrapper);  // Append the TOC to .table-of-content

    // Toggle dropdown effect without max-height restriction
    tocWrapper.querySelector("h2").addEventListener("click", function() {
        if (tocWrapper.classList.contains("open")) {
            tocList.style.height = "0";  // Collapse
        } else {
            tocList.style.height = `${tocList.scrollHeight}px`;  // Expand to full content height
        }
        tocWrapper.classList.toggle("open");
    });
});
