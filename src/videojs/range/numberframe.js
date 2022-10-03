import React from "react";

function Numberframe({ endtime }) {
  console.log(endtime, "????????/");
  return (
    <div>
      <div className="iv-relative">
        <div className="iv-flex iv-justify-between iv-items-center iv-w-[100px] iv-h-28 iv-px-8 iv-py-5 iv-mt-5 iv-bg-grey-0 dark:iv-bg-white-10 iv-rounded-sm">
          <input
            type="text"
            autoComplete="off"
            data-input="true"
            // inputMode="numeric"
            className="iv-w-full iv-text-body-2xl iv-text-black-90 dark:iv-text-white-90 iv-font-medium iv-outline-none"
            wrapperclass="iv-w-[100px] iv-h-28 iv-px-8 iv-py-5 iv-mt-5 iv-bg-grey-0 dark:iv-bg-white-10 iv-rounded-sm"
            minvalue={0}
            // maxvalue="7.04"
            // defaultValue="00:03:43"
            defaultValue={`${Number(endtime.start)} : ${endtime.end} `}
            style={{ backgroundColor: "transparent" }}
          />
          <div className="iv-flex iv-flex-col">
            <button type="button" className="iv-my-2 iv-outline-none">
              <svg
                width={10}
                height={10}
                viewBox="-2 -4 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.2506 0.333496C4.1256 0.166829 3.8756 0.166829 3.7506 0.333496L0.625604 4.50016C0.471095 4.70617 0.618089 5.00016 0.875603 5.00016L7.1256 5.00016C7.38312 5.00016 7.53011 4.70617 7.3756 4.50016L4.2506 0.333496Z"
                  fill="#262626"
                />
              </svg>
            </button>
            <button type="button" className="iv-my-2 iv-outline-none">
              <svg
                width={10}
                height={10}
                viewBox="-2 9 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.74947 14.6668C3.87447 14.8335 4.12447 14.8335 4.24947 14.6668L7.37447 10.5002C7.52898 10.2942 7.38198 10.0002 7.12447 10.0002H0.874469C0.616954 10.0002 0.46996 10.2942 0.624469 10.5002L3.74947 14.6668Z"
                  fill="#262626"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Numberframe;
