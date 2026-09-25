/* =====================================================
   SCRAPCONNECT CUSTOMER
   PRODUCTS COME FROM ADMIN
===================================================== */

let products = [];
let selectedProduct = null;


/* =====================================================
   LOAD PRODUCTS FROM ADMIN
===================================================== */

function loadProducts(){

    try{

        const saved =
            localStorage.getItem("scrapconnectProducts");

        products = saved
            ? JSON.parse(saved)
            : [];

        if(!Array.isArray(products)){
            products = [];
        }

    }catch(error){

        console.error("Product loading error:", error);

        products = [];

    }

    renderProducts();
}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts(){

    const grid =
        document.getElementById("scrapGrid");

    const noResults =
        document.getElementById("noResults");

    if(!grid) return;


    if(products.length === 0){

        grid.innerHTML = "";

        if(noResults){
            noResults.style.display = "block";
            noResults.innerHTML = `
                <div>📦</div>
                <h3>No products available</h3>
                <p>Admin has not added any scrap products yet.</p>
            `;
        }

        updateMaterialCount(0);

        return;
    }


    if(noResults){
        noResults.style.display = "none";
    }


    grid.innerHTML = products.map(function(product){

        const image =
            product.image ||
            "https://via.placeholder.com/300x220?text=Scrap";


        return `

        <article
            class="scrap-card"
            data-name="${escapeHTML(product.name)}">

            <div class="scrap-image">

                <img
                    src="${image}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.src='https://via.placeholder.com/300x220?text=Scrap';">

            </div>


            <div class="scrap-card-content">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>


                <p class="product-description">
                    ${escapeHTML(
                        product.description ||
                        "Sell your scrap easily with ScrapConnect."
                    )}
                </p>


                <div class="scrap-card-bottom">

                    <div>

                        <small>
                            Rate
                        </small>

                        <strong>
                            ₹${escapeHTML(product.rate)}/KG
                        </strong>

                    </div>


                    <button
                        class="sell-btn"
                        onclick="openSell(${product.id})">

                        Sell Now

                    </button>

                </div>

            </div>

        </article>

        `;

    }).join("");


    updateMaterialCount(products.length);
}


/* =====================================================
   MATERIAL COUNT
===================================================== */

function updateMaterialCount(count){

    const countElement =
        document.querySelector(".material-count b");

    if(!countElement) return;

    countElement.textContent =
        count + (count === 1 ? "" : "+");
}


/* =====================================================
   OPEN SELL MODAL
===================================================== */

function openSell(productId){

    selectedProduct =
        products.find(function(product){

            return Number(product.id) === Number(productId);

        });


    if(!selectedProduct){

        alert("Product not found.");

        return;

    }


    document.getElementById("sellTitle").textContent =
        selectedProduct.name;


    document.getElementById("selectedMaterial").textContent =
        selectedProduct.name;


    document.getElementById("quantity").value = "";


    document.getElementById("estimatedPrice").textContent =
        "₹0";


    document.getElementById("sellModal")
        .classList.add("show");

}


/* =====================================================
   CLOSE SELL
===================================================== */

function closeSell(){

    document.getElementById("sellModal")
        .classList.remove("show");

}


/* =====================================================
   CALCULATE PRICE
===================================================== */

const quantityInput =
    document.getElementById("quantity");


if(quantityInput){

    quantityInput.addEventListener(
        "input",
        function(){

            if(!selectedProduct){

                return;

            }


            const quantity =
                Number(this.value) || 0;


            const rate =
                Number(selectedProduct.rate) || 0;


            const total =
                quantity * rate;


            document.getElementById(
                "estimatedPrice"
            ).textContent =
                "₹" + total.toLocaleString("en-IN");

        }
    );

}


/* =====================================================
   GO TO PICKUP
===================================================== */

function goPickup(){

    const quantity =
        Number(
            document.getElementById("quantity").value
        );


    if(!selectedProduct){

        alert("Please select a scrap product.");

        return;

    }


    if(!quantity || quantity <= 0){

        alert("Please enter a valid quantity.");

        return;

    }


    document.getElementById("sellModal")
        .classList.remove("show");


    document.getElementById("pickupModal")
        .classList.add("show");

}


/* =====================================================
   CLOSE PICKUP
===================================================== */

function closePickup(){

    document.getElementById("pickupModal")
        .classList.remove("show");

}


/* =====================================================
   SUBMIT PICKUP REQUEST
===================================================== */

function submitRequest(){

    const name =
        document.getElementById(
            "customerName"
        ).value.trim();


    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const address =
        document.getElementById(
            "customerAddress"
        ).value.trim();


    const quantity =
        Number(
            document.getElementById("quantity").value
        );


    if(!name || !phone || !address){

        alert("Please fill all details.");

        return;

    }


    if(phone.replace(/\D/g,"").length < 10){

        alert("Please enter a valid mobile number.");

        return;

    }


    if(!selectedProduct){

        alert("Product not selected.");

        return;

    }


    const rate =
        Number(selectedProduct.rate) || 0;


    const total =
        quantity * rate;


    const request = {

        id:Date.now(),

        name:name,

        phone:phone,

        address:address,

        location:address,

        product:selectedProduct.name,

        scrapType:selectedProduct.name,

        quantity:quantity,

        rate:rate,

        estimatedPrice:total,

        status:"New",

        submittedAt:
            new Date().toLocaleString("en-IN")

    };


    let requests = [];


    try{

        requests =
            JSON.parse(
                localStorage.getItem(
                    "scrapconnectPickupRequests"
                )
            ) || [];

    }catch(error){

        requests = [];

    }


    if(!Array.isArray(requests)){

        requests = [];

    }


    requests.unshift(request);


    localStorage.setItem(
        "scrapconnectPickupRequests",
        JSON.stringify(requests)
    );


    document.getElementById(
        "pickupModal"
    ).classList.remove("show");


    document.getElementById(
        "customerName"
    ).value = "";


    document.getElementById(
        "customerPhone"
    ).value = "";


    document.getElementById(
        "customerAddress"
    ).value = "";


    showToast(
        "✓ Pickup request submitted successfully!"
    );

}


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
    document.getElementById("searchInput");


if(searchInput){

    searchInput.addEventListener(
        "input",
        function(){

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const cards =
                document.querySelectorAll(
                    ".scrap-card"
                );


            let visible = 0;


            cards.forEach(function(card){

                const name =
                    card
                        .getAttribute("data-name")
                        .toLowerCase();


                if(name.includes(search)){

                    card.style.display = "";

                    visible++;

                }else{

                    card.style.display = "none";

                }

            });


            const noResults =
                document.getElementById("noResults");


            if(noResults){

                noResults.style.display =
                    visible === 0
                        ? "block"
                        : "none";

            }

        }
    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message){

    const toast =
        document.getElementById("toast");


    if(!toast) return;


    const text =
        toast.querySelector("[data-lang='success']");


    if(text){

        text.textContent = message;

    }else{

        toast.textContent = message;

    }


    toast.classList.add("show");


    setTimeout(function(){

        toast.classList.remove("show");

    },3000);

}


/* =====================================================
   CART
===================================================== */

function updateCartCount(){

    let cart = [];


    try{

        cart =
            JSON.parse(
                localStorage.getItem(
                    "scrapconnectCart"
                )
            ) || [];

    }catch(error){

        cart = [];

    }


    if(!Array.isArray(cart)){

        cart = [];

    }


    const count =
        cart.reduce(function(total,item){

            return total +
                Number(item.quantity || 1);

        },0);


    const cartCount =
        document.getElementById("cartCount");


    if(cartCount){

        cartCount.textContent = count;

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =====================================================
   AUTO UPDATE
   If ADMIN adds product in another tab,
   CUSTOMER updates automatically.
===================================================== */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key ===
            "scrapconnectProducts"
        ){

            loadProducts();

        }


        if(
            event.key ===
            "scrapconnectCart"
        ){

            updateCartCount();

        }

    }
);


/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadProducts();

        updateCartCount();

    }
);