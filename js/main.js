console.log('main.js start');
//alert("Loading complete");
var typingTimer;
var doneTypingInterval = 250;
var $input = $('#myInput');

$input.on('keyup', function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);
})

$input.on('keydown', function () {
  clearTimeout(typingTimer);
})

function doneTyping() {
  myFunction();
}


//$("#myInput").keyup(myFunction);

function myFunction() {
  console.log('myFunction');
  // Declare variables
  var input, filter, table, tr, td, i,result;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  result = document.getElementById("myResultTable");

  if(filter === '') {
    console.log("LOL");
    //table.style.display = "";
    result.style.display = "none";
    var len = result.querySelectorAll('tr');
    for(var i = 0; i < len; i++) {
      result.querySelectorAll('tr')[i].remove();
    }
  }
  else {
    //table.style.display = "none";
    result.style.display = "";
    var tmp = [];
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          //tmp.push(tr[i].cloneNode(true));
          result.appendChild(tr[i].cloneNode(true));
          //tr[i].style.display = "";
        } else {
          //tr[i].style.display = "none";
        }
      }
    }

  }
  // Loop through all table rows, and hide those who don't match the search query
  /*
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }*/

}

myFunction();
