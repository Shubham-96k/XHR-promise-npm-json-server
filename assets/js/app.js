const cl = console.log;

const postform = document.getElementById("postform");
const postcontainer = document.getElementById("postcontainer");
const titleControl = document.getElementById("title");
const bodyControl = document.getElementById("body");
const userIdControl = document.getElementById("userId");
const submtbtn = document.getElementById("submtbtn");
const updtbtn = document.getElementById("updtbtn");
const loader = document.getElementById("loader");

let baseUrl = `http://localhost:3000`;
let postUrl = `${baseUrl}/posts`;

const postTemplating = eve => {
    result = " ";
    eve.forEach(ele => {
        result += `
                    <div class="card mb-2" id="${ele.id}">
                        <div class="card-header">
                            <h2 class="m-0">${ele.title}</h2>
                        </div>
                        <div class="card-body">
                            <p class="m-0">${ele.body}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-primary" type="button" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-danger" type="button" onclick="onDelete(this)">Delete</button>
                        </div>
                    </div>
        `
    });
    postcontainer.innerHTML = result;
}

const onEdit = eve => {
    let editid = eve.closest(".card").id;
    let editUrl = `${baseUrl}/posts/${editid}`;
    localStorage.setItem("editId", editid);
    makeApiCall("GET", editUrl)
        .then(res => {
            titleControl.value = res.title;
            bodyControl.value = res.body;
            userIdControl.value = res.userId;
            submtbtn.classList.add("d-none");
            updtbtn.classList.remove("d-none");
        })
        .catch(error => {
            alert(error);
        })
    scrollToTop();
}

const onUpdate = () => {
    let updtid = JSON.parse(localStorage.getItem("editId"));
    let updtUrl = `${postUrl}/${updtid}`;
    let updtobj = {
        title : titleControl.value,
        body : bodyControl.value,
        userId : userIdControl.value,
        id : updtid
    }
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        if (result.isConfirmed) {
                makeApiCall('PUT', updtUrl, updtobj)
                    .then(res => {
                        let childcards = [...document.getElementById(res.id).children];
                        childcards[0].innerHTML = `<h2>${res.title}</h2>`;
                        childcards[1].innerHTML = `<p>${res.body}</p>`;
                    })
                    .catch(error => {
                        cl(error)
                    })
                    Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
        }
                    updtbtn.classList.add("d-none");
                    submtbtn.classList.remove("d-none");
                    postform.reset();
      });
    
}

const onDelete = eve => {
    let deleteid = eve.closest(".card").id;
    let deleteUrl = `${postUrl}/${deleteid}`;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          makeApiCall('DELETE', deleteUrl)
            .then(res => {
                document.getElementById(deleteid).remove()
                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success",
                    timer: 1000
                  });
            })
            .catch(error => {
                cl(error);
            })
            
        }
      });
        
}

const makeApiCall = (methodname, apiUrl, bodymsg = null) => {
    return new Promise((resolve,reject) => {
        loader.classList.remove("d-none");
        let xhr = new XMLHttpRequest();
        xhr.open(methodname, apiUrl);
        xhr.setRequestHeader("content-type" , "application/json");
        bodymsg ? xhr.send(JSON.stringify(bodymsg)) : xhr.send();
        xhr.onload = () => {
            loader.classList.add("d-none");
            if(xhr.status >= 200 && xhr.status < 300 || xhr.readyState === 4){
                resolve(JSON.parse(xhr.response));
            }else{
                reject(`API call reject error status : ${xhr.status}`);
            }
        }
        xhr.onerror = function(){
            loader.classList.add("d-none");
        }
    })
}

makeApiCall("GET", postUrl)
    .then(res => {
        postTemplating(res);
    })
    .catch(error => alert(error));
    
const onAddpost = eve => {
    eve.preventDefault();
    let postobj = {
        title : titleControl.value,
        body : bodyControl.value,
        userId : userIdControl.value,
    }
    makeApiCall("POST", postUrl, postobj)
        .then(res => {
            let card = document.createElement("div");
            card.className = "card mb-2";
            card.id = `"${res.id}"`
            card.innerHTML = `
                        <div class="card-header">
                            <h2 class="m-0">${res.title}</h2>
                        </div>
                        <div class="card-body">
                            <p class="m-0">${res.body}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-primary" type="button" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-danger" type="button" onclick="onDelete(this)">Delete</button>
                        </div>
            `
            postcontainer.append(card);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Your work has been saved",
                timer: 1500
              });
        })
        .catch(error => {
            cl(error)
        })
}

updtbtn.addEventListener("click", onUpdate);
postform.addEventListener("submit", onAddpost);

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}