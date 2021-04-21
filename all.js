//-------------dom綁定-------------------------
//商品陳列區
const  productSelect =document.querySelector('.productSelect');
const  productWrap =document.querySelector('.productWrap');

//購物車
const  shoppingCartTable =document.querySelector('.shoppingCart-table');
const   shoppingCartTbody =shoppingCartTable.children[1];
const   shoppingCartTotalAmount =shoppingCartTable.children[2].children[0].children[3];
const   shoppingCartTotalAmountText =shoppingCartTable.children[2].children[0].children[2];
const   discardAllBtn = document.querySelector('.discardAllBtn');


//訂單
const  orderInfoForm =document.querySelector('.orderInfo-form');
const  customerName =document.querySelector('#customerName');
const  customerPhone =document.querySelector('#customerPhone');
const  customerEmail =document.querySelector('#customerEmail');
const  customerAddress =document.querySelector('#customerAddress');
const  tradeWay =document.querySelector('#tradeWay');


//------初始化與變數
let productList =[];
let cart ={};
let cartList =[];


 
function init(){
 getProductApi(); 
 getCartApi();
 addProductToCart();
 editCart();
 deleteProduct();

};
init()

//----取得api

//--------------產品展示-------------------
function getProductApi(){
 axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/products")
  .then(function (response) {
    
     productList =response.data.products;
     renderProduct();
     filterProduct();
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  

}

//render產品
function renderProduct(choice="全部"){
let str ='';
  if(choice =="全部"){    
productList.forEach(element => {
  str +=`
    <li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${element.images}"
            alt=""
          />
          <a href="#" class="addCardBtn" data-id =${element.id}>加入購物車</a>
          <h3>${element.title}</h3>
          <del class="originPrice">NT$${toThousands(element.origin_price)}</del>
          <p class="nowPrice">NT$${toThousands(element.price)}</p>
        </li>
  `;
  
});
  }
  else {
   productList.forEach(element => {
    if(element.category==choice) {
        str +=`
    <li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${element.images}"
            alt=""
          />
          <a href="#"class="addCardBtn" data-id =${element.id}>加入購物車</a>
          <h3>${element.title}</h3>
          <del class="originPrice">NT$${element.origin_price}</del>
          <p class="nowPrice">NT$${element.price}</p>
        </li>
  `;
    }     
});
  }  
  productWrap.innerHTML= str;

}

//篩選監聽
function filterProduct(){
  productSelect.addEventListener('change',e=>{
    let choice = e.target.value;    
   renderProduct(choice)
})

}

//------------購物車
//讀取購物車api
function getCartApi(){
axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/carts")
  .then(function (response) {  
    cart =  response.data;
   cartList =response.data.carts;    
   renderCart()
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
};
function renderCart(){
   let str ="";
  //購物車內無產品  
  if(cartList.length ===0){    
     
     str=`
     <p class="noProductTbody">快去挑選妳喜歡的產品窩窩</p>
     `

     shoppingCartTotalAmount.classList.add("cartNoProduct");
     shoppingCartTotalAmountText.classList.add("cartNoProduct");
     discardAllBtn.classList.add("cartNoProduct");
     shoppingCartTbody.innerHTML = str;
     return
  } 
  //購物車內有產品
  cartList.forEach(element => {
    
    str+=`
       <tr>
              <td>
                <div class="cardItem-title">
                  <img src="${element.product.image}" alt="" />
                  <p>${element.product.title}</p>
                </div>
              </td>
              <td>NT$${toThousands(element.product.price)}</td>
              <td> 
            <a href="#"><span class="material-icons cartAmount-icon" data-num=" ${element.quantity-1}" data-id="${element.id}">remove</span></a>
            <span> ${element.quantity}</span>
            <a href="#"><span class="material-icons cartAmount-icon" data-num="${element.quantity+1}" data-id="${element.id}">add</span></a>
          </p>
             </td>
              <td>NT$${toThousands(element.product.price*element.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id =${element.id}> clear </a>
              </td>
            </tr>
    `;
   
   

  });
   shoppingCartTbody.innerHTML = str;
    shoppingCartTotalAmount.textContent=`NT$${toThousands(cart.finalTotal)}`;
    
     shoppingCartTotalAmount.classList.remove("cartNoProduct");
     shoppingCartTotalAmountText.classList.remove("cartNoProduct");
     discardAllBtn.classList.remove("cartNoProduct");
}
//購物車無產品
function showNoProduct(){

}
//新增產品到購物車
function addProductToCart(){
//監聽加入購物車事件
productWrap.addEventListener("click",e=>{
  e.preventDefault();
  let addBtn =e.target;
 
   if(addBtn.getAttribute('class')==='addCardBtn'){
     let productId =addBtn.dataset.id;

     //處理購買數量
     let buyQuantity = 1;     
     cartList.forEach(element=>{
       if(element.product.id ===productId){
         buyQuantity = element.quantity+1
       }      
       
     })
    //發出請求
    axios.post('https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/carts', {
    data: {
    "productId": productId,
    "quantity": buyQuantity
  }
  })
  .then(function (response) {
    //更新購物車畫面
    cart =  response.data;    
   cartList =response.data.carts;    
  
   renderCart() 

  })
  .catch(function (error) {
    console.log(error);
  });
   }
  
})

};

//修改購物車產品數量
function editCart(){
  shoppingCartTbody.addEventListener("click",e=>{
    let  editBtn =e.target
    
    if(editBtn.getAttribute('class').includes('cartAmount-icon')){
      let cartId =editBtn.dataset.id;
      let cartProductAmount =parseInt(editBtn.dataset.num);  
      console.log(cartProductAmount)
      //發出修改請求
      //如果購物車的商品數量將為零，發出刪除請求
      if(cartProductAmount===0){
        axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/carts/${ cartId}`)
        .then(function (response) {               
     cart =  response.data;  
   cartList =response.data.carts  ;  
   renderCart() 
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

      }else{
             axios.patch(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${path}/carts`,{
      "data": {
    "id":cartId,
    "quantity": cartProductAmount
  }
    }).
    then(function (response) {
         cart =  response.data;    
         cartList =response.data.carts;    
         renderCart()         
     })
      }    
    }    
  })
}
//刪除單一商品
function deleteProduct(){
  shoppingCartTbody.addEventListener("click",e=>{
    e.preventDefault();
    let deleteBtn =e.target;

    if(deleteBtn.getAttribute('class') =="material-icons"){
      let productId = deleteBtn.dataset.id;
      axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/carts/${productId}`).then(function (response) {  
      
        
     cart =  response.data;    

   cartList =response.data.carts  ;  
   renderCart() 
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

    }
    
  })

}
//刪除所有商品
 discardAllBtn.addEventListener('click',e=>{
  e.preventDefault();
   //發出請求，刪除
    axios.delete('https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/carts');
    
    //清空cart變數
    cart = {};    
   cartList =[]; 
   //重新顯示購物車
    renderCart()


 }) 


 //-------訂單-------
orderInfoForm.addEventListener('click',e=>{
  e.preventDefault();
  if(e.target.getAttribute('class')!=="orderInfo-btn"){
    return
  }
 let customerNameValue =customerName.value;;
 let customerPhoneValue =customerPhone.value;
 let customerEmailValue = customerEmail.value;
 let customerAddressValue =customerAddress.value;
 let tradeWayValue =tradeWay.value; ;
  let  orderData = 
   {
    "user": {
      "name": customerNameValue,
      "tel": customerPhoneValue,
      "email":  customerEmailValue,
      "address": customerAddressValue,
      "payment": tradeWayValue
    }
  };

  //驗證email格式-防止訂單成立
  if(!validateEmail(customerEmailValue)){
     alert("請填寫正確的email");
     return
  }
  //驗證手機格式-防止訂單成立
  if(!validatePhone(customerPhoneValue)){
   alert("請輸入格式正確的電話");
   return
  }
  //發出送訂單的要求
axios.post('https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/shang/orders',{
  "data": orderData
}).then(function (response) {  
    alert('訂單建立成功~');  
      //清除訂單文字
     customerName.value ="";
   customerPhone.value ="";
   customerEmail.value="";
   customerAddress.value ="";
   tradeWay.value ="";  
   getCartApi()

  })
  .catch(function (error) {     
      if(error.response.status ==400){
        alert(error.response.data.message)
      }    
  }); 
});

//驗證email格式
customerEmail.addEventListener("blur",e=>{
  if(!validateEmail(customerEmail.value)){
   document.querySelector(`[data-message="Email"]`).textContent = "請輸入格式正確的email";
  }
});
//驗證手機格式
customerPhone.addEventListener("blur",e=>{
  if(!validatePhone(customerPhone.value)){
   document.querySelector(`[data-message="電話"]`).textContent = "請輸入格式正確的電話";
  }
})



//處理千位數
function toThousands(num) {
    let num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }

  //驗證表單
  //1.表單有填入資料
  const inputs = document.querySelectorAll("input[name],select[data=payment]");
    
    const constraints = {
      "姓名": {
        presence: {
          message: "必填欄位"
        }
      },
      "電話": {
        presence: {
          message: "必填欄位"
        },
        length: {
          minimum: 8,
          message: "需超過 8 碼"
        }
      },
      "信箱": {
        presence: {
          message: "必填欄位"
        },
        email: {
          message: "格式錯誤"
        }
      },
      "寄送地址": {
        presence: {
          message: "必填欄位"
        }
      },
      "交易方式": {
        presence: {
          message: "必填欄位"
        }
      },
    };


    inputs.forEach((item) => {
      item.addEventListener("change", function () {
        
        item.nextElementSibling.textContent = '';
        let errors = validate( orderInfoForm, constraints) || '';
        console.log(errors)

        if (errors) {
          Object.keys(errors).forEach(function (keys) {
            // console.log(document.querySelector(`[data-message=${keys}]`))
            document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
          })
        }
      });
    });

    //驗證email
    function validateEmail(mail) {
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)){
    return true
  }    
    return false
};

//驗證手機號碼

   function validatePhone(phone) {
 if (/^[09]{2}[0-9]{8}$/.test(phone)){   
    return true   
  }  
  
    return  false
 
};













