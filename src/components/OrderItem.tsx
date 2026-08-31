import React, { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import Item from "./Item";
import { Footer } from "./core";
import { clearCart } from "@/lib/cart/cartSlice";
import HistoryOrder from "./HistoryOrder";
import numeral from "numeral";
import { useParams } from "next/navigation";
import axios from "axios";
import { orderHistoryType } from "@/types/model";
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from "@/lib/i18n";


export default function OrderItem({ cur, historyOrder, setHistoryOrder, isClickOrder, setClickOrder }: any) {
  const { t } = useTranslation();
  const { projectName, tableNumber } = useParams()
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const { items: basket, totalItems, totalPrice } = useSelector((state: RootState) => state.cart);

  const dispatch = useDispatch()

  // Fetch table name fallback if history order is null
  const [tableName, setTableName] = useState("");

  useEffect(() => {
    if (historyOrder?.data?.table_name) {
      setTableName(historyOrder.data.table_name);
    } else if (tableNumber) {
      const fetchTableName = async () => {
        try {
          const res = await axios.get(`https://pos-sotso.tsdsolution.net/api/DriverController`);
          if (res.data && Array.isArray(res.data)) {
            const currentTable = res.data.find((t: any) => t.id === tableNumber);
            if (currentTable) {
              setTableName(currentTable.name);
            }
          }
        } catch (e) {
          console.error("Error fetching table name", e);
        }
      };
      fetchTableName();
    }
  }, [historyOrder, tableNumber]);

  // my code old

  const handleOrder = async () => {
    setIsLoading(true);
    const loading = toast.info("កំពុងធ្វើការកុម្ម៉ង់...", {
      autoClose: 2000,
      position: "top-center",
      className: "font-battambang",
      containerId: "modal-toast"
    });

    const product = basket.map(({ id, quantity, comment }) => ({
      id: id,
      quantity: quantity,
      comment: comment || null,
    }));

    try {
      const data = {
        data: {
          id: historyOrder ? historyOrder?.data.id : null,
          suspend_note: historyOrder ? historyOrder?.data.suspend_note : null,
          table_id: tableNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
        },
        items: product,
      };
      const jsonData = JSON.stringify(data)
      const response = await axios.post(
        `https://pos-sotso.tsdsolution.net/api/DriverController/order`,
        jsonData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.dismiss(loading)
      toast.success("ការកុម្ម៉ង់ទទួលបានជោគជ័យ!", {
        autoClose: 2000,
        position: "top-center",
        className: "font-battambang"
      });

      // end akk
      dispatch(clearCart());
      setClickOrder(!isClickOrder);
      setCustomerName("");
      setCustomerPhone("");

      const modal = document.getElementById('my_modal_3') as HTMLDialogElement | null;
      if (modal) {
        modal.close();
      }
      
      const infoModal = document.getElementById('customer_info_modal') as HTMLDialogElement | null;
      if (infoModal) {
        infoModal.close();
      }

    } catch (error) {
      console.error('Error sending order:', error);
      toast.dismiss(loading)
      toast.error("ការកុំម្ម៉ង់បរាជ័យ! សូមព្យាយាមម្តងទៀត!", {
        autoClose: 2000,
        position: "top-center",
        className: "font-battambang",
        containerId: "modal-toast"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}

      <dialog id={"my_modal_3"} className={`modal backdrop-blur-[2px]`}>
        <ToastContainer containerId="modal-toast" position="top-center" style={{ zIndex: 99999 }} />
        <div className="modal-box p-0 bg-white text-gray-900">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn  btn-sm btn-circle btn-ghost absolute right-2 top-2 text-xl  z-10">
              ✕
            </button>
          </form>
          <div className="flex flex-col h-[100vh]  items-center relative ">
            <div>
              <h1 className="text-center font-dangrek p-2 text-xl"> {t("orderSummary")}<br />
                <span className="text-orange-400">{tableName}</span></h1>
            </div>
            <div className="w-full bg-transparent border-[1px] border-dashed border-black"></div>
            <div className="w-full px-4">

              {/* new order  */}
              {basket.length == 0 ? (<></>) : <h1 className="text-center font-dangrek p-2 mb-5">{t("newOrder")}</h1>}
              {/* item cart  */}
              {
                basket.map((item, index) => (
                  <Item key={index} cartItem={item} cur={cur} index={index} />
                ))
              }
            </div>
            {basket.length == 0 ? (<></>) : (
              <div className="w-full flex flex-col items-center mt-4 px-2 space-y-2">
                <button onClick={() => {
                  const infoModal = document.getElementById('customer_info_modal') as HTMLDialogElement;
                  if (infoModal) infoModal.showModal();
                }} className="bg-orange font-dangrek p-2 px-5 rounded-full text-white mt-2 w-full">{t("placeOrder")}</button>
              </div>
            )}

            {/* history order section  */}
            {historyOrder ? (
              <div className="w-full px-3 ">
                <h1 className="font-dangrek text-center mt-5">{t("completedOrder")}</h1>
                <div className="flex flex-col w-full space-y-3">
                  {
                    historyOrder?.items?.map((item: any, index: any) => (
                      <HistoryOrder key={index} cartItem={item} cur={cur} index={index} />
                    ))
                  }
                </div>
              </div>
            ) : (<></>)
            }
            {/* summary section  */}
            <div className="w-full flex flex-col space-y-2 p-3">
              <p className="text-lg flex flex-row justify-between">
                <span className="font-dangrek  " >{t("totalItems")}:</span>
                <span className="font-bold">{historyOrder ? parseInt(historyOrder.data.totalItems) + totalItems : totalItems}</span>
              </p>
              <p className="text-xl flex flex-row text-orange-500  justify-between">
                <span className="font-dangrek  " >{t("totalAmount")}:</span>
                <span className="font-bold">{cur || "$"}{historyOrder ? numeral(parseFloat(historyOrder.data.total_price) + totalPrice).format('0.[00]') : numeral(totalPrice).format('0.[00]')}</span>
              </p>
            </div>
            <div className="mt-5">
              <Footer></Footer>
            </div>
          </div>

        </div>
      </dialog>

      {/* Customer Info Modal */}
      <dialog id="customer_info_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
        <div className="modal-box bg-white text-gray-900 rounded-t-[2rem] sm:rounded-3xl max-w-sm p-6 sm:p-8 shadow-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500 hover:bg-gray-100 z-10">✕</button>
          </form>
          
          <div className="flex flex-col items-center mb-6 mt-2">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-dangrek font-bold text-2xl text-center text-gray-800">ព័ត៌មានអតិថិជន</h3>
            <p className="text-sm font-battambang text-center text-gray-500 mt-1">សូមបញ្ជាក់ឈ្មោះ និងលេខទូរស័ព្ទរបស់អ្នក</p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-battambang font-medium text-gray-600">ឈ្មោះអតិថិជន (Name)</span>
              </label>
              <input type="text" placeholder="បញ្ចូលឈ្មោះ..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input input-bordered w-full font-battambang bg-gray-50 border-gray-200 focus:bg-white focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-xl" />
            </div>
            
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-battambang font-medium text-gray-600">លេខទូរស័ព្ទ (Phone)</span>
              </label>
              <input type="tel" placeholder="បញ្ចូលលេខទូរស័ព្ទ..." value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input input-bordered w-full font-battambang bg-gray-50 border-gray-200 focus:bg-white focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-xl" />
            </div>
            
            <button onClick={handleOrder} disabled={isLoading} className="bg-orange hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange/30 font-dangrek py-3.5 mt-6 rounded-2xl text-white text-lg w-full flex justify-center items-center gap-2">
              {isLoading ? (
                 <>
                   <span className="loading loading-spinner loading-sm"></span>
                   កំពុងដំណើរការ...
                 </>
              ) : "បញ្ជាក់ការកុម្ម៉ង់ (Confirm)"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="cursor-default text-transparent">.</button>
        </form>
      </dialog>
    </>
  );
}


