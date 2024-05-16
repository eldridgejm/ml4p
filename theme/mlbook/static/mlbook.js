// wait until the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // set the "data-bs-spy" attribute of the body element to "scroll"
  // this enables the Bootstrap scrollspy plugin
  document.body.setAttribute('data-bs-spy', 'scroll');

  // set the "data-bs-target" attribute of the body element to "#tocbar"
  // this tells the scrollspy plugin to use the tocbar as the target
  document.body.setAttribute('data-bs-target', '#tocbar');

  // change the headerlink content to be # instead of the paragraph symbol
  let headerLinks = document.querySelectorAll('.headerlink');
  headerLinks.forEach(function(link) {
    link.textContent = '#';
  });

  // change "Show Answer" buttons to "Hide Answer" when clicked
  let showAnswerButtons = document.querySelectorAll('.exercise-show-answer-button');
  showAnswerButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      if (button.textContent === 'Show Answer') {
        button.textContent = 'Hide Answer';
      } else {
        button.textContent = 'Show Answer';
      }
    });
  });


})
