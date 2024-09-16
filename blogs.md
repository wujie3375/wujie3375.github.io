---
layout: page
permalink: /blogs/index.html
title: Blogs
---

> **Last Update:** September 16, 2024

# Time Stamps

<div style="height: 200px; overflow-y: scroll; border: 0px solid #ccc; padding: 10px;">

  <p>Just writing down some thoughts and feelings here.</p>
  
  <h2>2024</h2>

  <ul>
    <li>
      <strong>Sep 10, 2024:</strong> It's the first day of making my personal homepage, and I'm really excited about it! 🎉🎉
    </li>
    
  </ul>
</div>


---

# Gallery

<div class="gallery-container">
  <!-- Gallery Item 1 -->
  <div class="gallery-item" onclick="openModal('img1')">
    <img src="https://wujie3375.github.io/images/gallery/220725.jpg" alt="Photo 1 Thumbnail" />
    <div class="gallery-caption">
      <p><strong>Description:</strong> This is a description of Photo 1.</p>
      <p><strong>Date:</strong> April 1, 2024</p>
      <p><strong>Location:</strong> Chongqing, China</p>
    </div>
  </div>

  <!-- Gallery Item 2 -->
  <div class="gallery-item" onclick="openModal('img2')">
    <img src="https://wujie3375.github.io/images/gallery/220601.jpg" alt="Photo 2 Thumbnail" />
    <div class="gallery-caption">
      <p><strong>Description:</strong> This is a description of Photo 2.</p>
      <p><strong>Date:</strong> May 1, 2024</p>
      <p><strong>Location:</strong> Beijing, China</p>
    </div>
  </div>

  <!-- Add more gallery items as needed -->
</div>

<!-- Modal for viewing large images -->
<div id="modal" class="modal">
  <span class="modal-close" onclick="closeModal()">&times;</span>
  <div class="modal-content">
    <img id="modal-img" src="" alt="Large View" />
  </div>
</div>

<style>
  .gallery-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    padding: 10px;
  }
  
  .gallery-item {
    position: relative;
    width: 150px; /* Width of the thumbnail */
    height: 150px; /* Height of the thumbnail to ensure 1:1 ratio */
    cursor: pointer;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensure the image covers the area while maintaining aspect ratio */
  }
  
  .gallery-caption {
    text-align: center;
    font-size: 14px;
    padding: 5px;
  }
  
  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    max-width: 90%;
    max-height: 90%;
  }
  
  .modal img {
    width: 100%;
    height: auto;
  }
  
  .modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 30px;
    color: white;
    cursor: pointer;
  }
</style>

<script>
  function openModal(imgId) {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    modal.style.display = 'flex';
    modalImg.src = document.querySelector(`.gallery-item[onclick*='${imgId}'] img`).src.replace('-thumb', '');
  }

  function closeModal() {
    document.getElementById('modal').style.display = 'none';
  }
</script>

