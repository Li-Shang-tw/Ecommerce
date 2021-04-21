//dom
const orderPageTable =document.querySelector('.orderPage-table');
const orderTableBody =orderPageTable.children[1];
const discardAllBtn =document.querySelector('.discardAllBtn');


//初始與變數
let  orderList = [];

function init2(){
getOrders();
 deleteAllOrder();
 deleteSpecificOrder();
 

}
init2()
//get所有訂單資訊
function getOrders(){
 axios.get("https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/shang/orders", {
    headers: {
      'Authorization': token
    }})
  .then(function (response) {  
   
   orderList =response.data.orders; 
   renderOrder()
   
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
};

//render訂單
function renderOrder(){
  let str ="";
   let chartList =[];
  //訂單為零的情況
  if(orderList.length <1){
    str+=`<tr>
    <td>
    <p>無訂單資料窩</p>
    </td>
    </tr>`
    gerateChart(chartList);   
  }
  else{
    orderList.forEach(element=>{    
     //組訂單字串
     //產生chart所需的資料
     let productStr ='';    
     
     element.products.forEach(product=>{
       productStr+=`
       <p>${product.title}x${product.quantity}
       </p>`
       //產生chartList
       //判斷是否已有品項
       let hasAdd =false;
       chartList.forEach(item=>{
         if(item[0]===product.title){
           item[1] +=product.quantity;
            hasAdd= true;
         }
       })
       if(hasAdd === false){
         let chartItem =[];
       chartItem.push(product.title);
        chartItem.push(product.quantity);
        chartList.push(chartItem)
       } 
     })
     
    //處理日期
    
    let orderDate =formatTime(element.updatedAt);
    
    //處理狀態
    let orderStatus="";
    if(element.paid ===false){
      orderStatus ="未處理"
    }
    else{
        orderStatus ="已處理"
    }
    str +=`
      <tr>
              <td>${element.id}</td>
              <td>
                <p>${element.user.name}</p>
                <p>${element.user.tel}</p>
              </td>
              <td>${element.user.address}</td>
              <td>${element.user.email}</td>
              <td>
                <p>${productStr}</p>
              </td>
              <td>${ orderDate}</td>
              <td class="orderStatus">
                <a href="#">${orderStatus }</a>
              </td>
              <td>
                <input type="button" 
                class="delSingleOrder-Btn" 
                data-id="${element.id}"
                value="刪除" />
              </td>
            </tr>
    `  
  })
    gerateChart(chartList)
}  
  orderTableBody.innerHTML =str;
}

//刪除單一訂單
function deleteSpecificOrder(){
  //事件監聽
 orderTableBody.addEventListener("click",e=>{
   //鎖定刪除按鈕
   let deleteBtn =e.target;
   
   if(deleteBtn.getAttribute('class')==='delSingleOrder-Btn'){
     let orderId = deleteBtn.dataset.id;
     //發出delete請求
      axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
     }
   })
     .then(function (response) {
      
       orderList =response.data.orders;
       renderOrder()
     })
   .catch(function (error) {
     // handle error
     console.log(error);
   })
   }
  
 })
}

//刪除所有訂單
function deleteAllOrder(){
  discardAllBtn.addEventListener("click",e=>{
   axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${path}/orders`,
    {
      headers: {
        'Authorization': token
     }
   })
     .then(function (response) {
      
       orderList =response.data.orders;
       renderOrder()
     })
   .catch(function (error) {
     // handle error
     console.log(error);
   })
 })}
 
//變更訂單狀態

//c3圖示
function gerateChart(originList){
   let chartList = originList;
  //整理資料 取前三名
  if(chartList.length >3){
    //排列
    chartList.sort((a,b)=>{
       return b[1] - a[1];
    })
    
    let othersList = chartList.splice(3, chartList.length-3 );   
   let otherItem =["其他類別",0];
   othersList.forEach(item=>{
  otherItem[1]+=item[1];
   })
  
   chartList.push(otherItem);
    console.log(chartList)
  }
  
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: chartList,
        
       
    },
    
});
}

//Util
//處理時間格式
function formatTime(timeStamp){
let time =moment(timeStamp*1000).format('YYYY/MM/DD');
return time
}


