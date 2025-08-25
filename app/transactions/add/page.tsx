"use client";

import { TransactionForm, TransactionFormData } from "@/components/transaction-form";

export default function AddTransactionPage() {
  const handleSubmit = async (data: TransactionFormData) => {
    console.log("Transaction data:", data);
    // TODO: Supabaseに保存する処理を実装
    
    // 仮の処理 - データをコンソールに出力
    alert("取引が保存されました！（開発中のため実際には保存されません）");
  };

  const handleCancel = () => {
    // 前のページに戻る
    window.history.back();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">新しい取引を追加</h1>
        <p className="text-gray-600 mt-2">
          収入や支出の詳細を入力して記録してください
        </p>
      </div>
      
      <TransactionForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}