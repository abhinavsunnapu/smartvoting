import React from "react";
import ElectionMsg from "../components/ElectionMsg";
import { Link, NavLink } from "react-router-dom";
import WebGroupServices from "../assets/Web-groupServices.jpg";

const Elections = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center w-full">
        <h1 className="inter-font text-[32px] pt-6 pb-2 font-semibold text-[#262D34]">
          3 Easy Steps to Election Excellence
        </h1>
        <p className="text-[16px] text-orange-400 pb-4 inter-font font-bold">
          How Elections Work in ElectionBuddy
        </p>
      </div>
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-col">
          <ElectionMsg
            SerialNo="1"
            heading="Design your perfect ballot in minutes"
            headingInfo="Add your election name and schedule dates. Choose from a variety of ballot types and add candidate details, photos and bios, or approvals with bylaws documents. Personalize notices for email, text message, postcards or letters. Then add your voter list and let the voting begin."
          ></ElectionMsg>
          <ElectionMsg
            SerialNo="2"
            heading="It's easy for voters to vote"
            headingInfo="Voters receive notice by email, text or mail and click to vote on their computer, phone or tablet. Schedule reminders to effortlessly increase turnout, and we'll monitor notice delivery for you too!"
          ></ElectionMsg>
          <ElectionMsg
            SerialNo="3"
            heading="Immediate high-integrity results"
            headingInfo="Results are tallied instantly and shared automatically with voters or after approval, you choose. Add results to your website and statistics to your member management system, while keeping voter's choices secret and ensuring observability."
          ></ElectionMsg>
        </div>
        <div
          className=" w-[40%] "
          style={{
            backgroundImage: `url(${WebGroupServices})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
      <div className="flex flex-col mb-20">
        <p className="ml-30 inter-font text-[16px] text-[#262D3A] font-semibold py-4">
          Next Step
        </p>
        <NavLink className="w-70 px-7 py-3 text-white font-semibold text-md inter-font rounded-md flex justify-center bg-[#00263A] hover:bg-[#001a28] transition ml-30">
          Explore Service Options
        </NavLink>
      </div>
    </div>
  );
};

export default Elections;
