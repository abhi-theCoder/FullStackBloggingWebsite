//By @nodws
//Feel free to use it on your project, paypal me a beer if you want :D pay@nodws.com
const openButton = document.querySelector("#openMenu");
 
const dialog = document.querySelector("dialog");

openButton.addEventListener("click", () => {
    dialog.showModal();
});
 
dialog.addEventListener("click", ({ target: dialog }) => {
    if (dialog.nodeName === "DIALOG") {
        dialog.close("dismiss");
    }
});



//Collection
  $(document).ready(function () {
    $('.owl-carousel').owlCarousel({
      loop: true,
      margin: 15,
      nav: false, /* Set this to false to remove arrows */
      dots: true, /* Keep dots for pagination */
      autoplay: true,
      autoplayTimeout: 3000,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 2
        },
        1000: {
          items: 3
        }
      }
    });
  });

  //Header animation
  

  //FAQ--------------------------------
  
  
