import React from "react";
import StatCardComp from "./components/StatCardComp";
import ReceiptsTable from "./components/ReceiptTable";

const Reciepts = () => {
    return (
        <div>
            <StatCardComp />
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:gap-8 w-full">
                <ReceiptsTable />
                <ReceiptsTable />
            </div>
        </div>
    );
};

export default Reciepts;
