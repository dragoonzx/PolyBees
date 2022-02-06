import React, { useState } from "react";
import {
  useNewMoralisObject,
  useMoralisQuery,
  useMoralis,
} from "react-moralis";
import classNames from "classnames";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import TwitterModule from "../../abis/TwitterModule.json";

const TWITTER_CONTRACT = "0xC7E62A952AF4A0bCCc8A73446e6243B454F6835D";

const BeesApp = () => {
  const [panel, setPanel] = useState("list");
  const { account, isAuthenticated } = useMoralis();

  const { fetch, data, isLoading } = useMoralisQuery("Tasks");
  const { isSaving, save } = useNewMoralisObject("Tasks");

  const [fields, setFields] = useState({
    text: "",
    twitter: "",
    address: "",
    bounty: 0,
  });

  const submitOfferContract = async ({
    influencerHandle,
    requiredText,
    rewardAddress,
    value,
  }) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const twitterContract = new ethers.Contract(
      TWITTER_CONTRACT,
      TwitterModule,
      signer,
    );

    const tx = await twitterContract.newOffer(
      influencerHandle,
      requiredText,
      rewardAddress,
      { value: ethers.utils.parseUnits(String(value)) },
    );
    await tx.wait();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const twitterContract = new ethers.Contract(
        TWITTER_CONTRACT,
        TwitterModule,
        signer,
      );
      await submitOfferContract({
        influencerHandle: fields.twitter,
        requiredText: fields.text,
        rewardAddress: fields.address,
        value: fields.bounty,
      });
      // ether callStatic counter and set it into order
      const counter = await twitterContract.counter();
      console.log({ counter });
      await save({
        ...fields,
        owner: account,
        counter: String(Number(counter)),
      });
      console.log("SUCCESSFULY SAVED");
      await fetch();

      toast.success("Successfully saved");
      setTimeout(() => {
        setFields({
          text: "",
          twitter: "",
          address: "",
          bounty: 0,
        });
        // route to all jobs
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error("Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const redeemTask = (id) => {
    console.log(id);
  };

  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const claimTask = async (offerId) => {
    setIsClaiming(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = new ethers.Wallet(
      process.env.REACT_APP_DECIDER_KEY,
      provider,
    );

    const twitterContract = new ethers.Contract(
      TWITTER_CONTRACT,
      TwitterModule,
      signer,
    );

    const tx = await twitterContract.resolveOffer(Number(offerId - 1));
    await tx.wait();

    setTimeout(() => {
      setIsClaiming(false);

      toast.success("Successfully claimed");

      setIsClaimed(true);
    }, 1000);

    await fetch("https://api.nftport.xyz/v0/mints/easy/urls", {
      method: "POST",
      headers: {
        Authorization: process.env.REACT_APP_NFT_PORT,
      },
      body: JSON.stringify({
        chain: "polygon",
        name: "PolyBees",
        description: "Proof of Work NFT",
        file_url:
          "https://raw.githubusercontent.com/dragoonzx/PolyBees/cd140337fbe4e28e1c558b616c92d8ce8c48d864/src/assets/logo.svg",
        mint_to_address: account,
      }),
    });
  };

  console.log(data);
  console.log(isAuthenticated, account);

  return (
    <div className="-mt-8">
      <div className="absolute indicator left-0 top-0 -mt-8 rounded-lg shadow drawer w-52 overflow-visible">
        <div className="drawer-side max-w-full w-full">
          <label className="drawer-overlay"></label>
          <ul className="menu p-4 overflow-y-auto bg-base-100 text-base-content">
            <li>
              <a className="mr-2" onClick={() => setPanel("list")}>
                All jobs
              </a>
            </li>
            <li>
              <a>Active jobs</a>
            </li>
            <li>
              <a>Completed jobs</a>
            </li>
          </ul>
        </div>
        {data.find(
          (v) => v?.get("address")?.toLowerCase() === account?.toLowerCase(),
        ) ? (
          <div className="indicator-item badge badge-primary">
            You have new one
          </div>
        ) : null}
      </div>
      <button
        onClick={() => setPanel("create")}
        className="absolute left-0 -mt-8 top-44 w-52 btn btn-primary"
      >
        Create now
      </button>
      <div
        className="absolute left-80 -mt-8 top-0"
        style={{ width: "calc(100% - 333px)" }}
      >
        {panel === "create" ? (
          <div>
            <div className="p-10 card bg-base-200">
              <h1 className="text-xl font-bold -mt-4">
                Fill in the information
              </h1>
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Tweet text</span>
                </label>
                <input
                  value={fields.text}
                  onChange={(e) =>
                    setFields({ ...fields, text: e.target.value })
                  }
                  type="text"
                  placeholder="Hey, check this amazing event @placeholder"
                  className="input text-primary-content"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Influencer twitter tag</span>
                </label>
                <input
                  value={fields.twitter}
                  onChange={(e) =>
                    setFields({ ...fields, twitter: e.target.value })
                  }
                  type="text"
                  placeholder="@cryptoinfluencer3000"
                  className="input text-primary-content"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Default address (destination address)
                  </span>
                </label>
                <input
                  value={fields.address}
                  onChange={(e) =>
                    setFields({ ...fields, address: e.target.value })
                  }
                  type="text"
                  placeholder="0xB02279F5D6F34851634Aa48ffa4d6d127c0b6998"
                  className="input text-primary-content"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bounty (in MATIC)</span>
                </label>
                <input
                  value={fields.bounty}
                  onChange={(e) =>
                    setFields({
                      ...fields,
                      bounty: Number.parseFloat(e.target.value),
                    })
                  }
                  type="number"
                  placeholder="25 MATIC"
                  className="input text-primary-content"
                />
              </div>
              <button
                onClick={() => submitForm()}
                className={classNames(
                  "btn btn-primary mt-8 w-28",
                  isSaving || isSubmitting ? "loading" : "",
                )}
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isLoading ? (
              "Loading..."
            ) : (
              <div className="flex flex-wrap">
                {[...data].reverse().map((v) => (
                  <div
                    key={v.id}
                    className="card card-bordered w-72 mr-2 mb-2 text-primary-content"
                  >
                    <div className="card-body relative">
                      {v?.get("owner")?.toLowerCase() ===
                        account?.toLowerCase() && (
                        <div
                          onClick={() => redeemTask(v.id)}
                          className="absolute right-4 top-4"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      )}
                      <h2 className="card-title">
                        {v.get("twitter")}
                        <div className="badge mx-2 badge-secondary">NEW</div>
                      </h2>
                      <p>
                        <span className="font-bold text-lg">Text:</span>
                        <br /> {v.get("text")}
                      </p>

                      <div className="card-actions items-center">
                        {account?.toLowerCase() ===
                        v?.get("address")?.toLowerCase() ? (
                          <button
                            onClick={() => claimTask(v?.get("counter"))}
                            className={classNames(
                              "btn",
                              isClaimed ? "btn-success" : "btn-secondary",
                              isClaiming ? "loading" : "",
                            )}
                          >
                            {isClaimed ? "Claimed!" : "Claim"}
                          </button>
                        ) : null}
                        <p className="justify-end">
                          Bounty: {v.get("bounty")} MATIC
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeesApp;
