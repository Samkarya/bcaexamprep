// Modal logic for showing info popups
    const modal = document.getElementById("info-modal");
    const modalText = document.getElementById("info-text");
    const modalClose = document.getElementsByClassName("close")[0];
  
    document.querySelectorAll('.info-btn').forEach(button => {
        button.addEventListener('click', function () {
            modalText.textContent = this.getAttribute('data-info');
            modal.style.display = "block";
        });
    });
  
    modalClose.onclick = function () {
        modal.style.display = "none";
    };
  
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
