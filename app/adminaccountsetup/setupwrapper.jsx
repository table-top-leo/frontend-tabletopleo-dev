"use client";
import { useState } from "react";
import { FaListAlt, FaCreditCard, FaQrcode, FaTruck, FaChartBar, FaUtensils, FaLock, FaBox, FaBuilding, FaStore, FaChartLine, FaBolt } from "react-icons/fa";
import { MdMenuBook, MdTableRestaurant } from "react-icons/md";
import Stepper from "../adminaccountsetup/stepper";
import AccountSetup from "../adminaccountsetup/accountsetup";
import BusinessType from "../adminaccountsetup/businesstype";
import BusinessInformation from "../adminaccountsetup/businessinformation";
import SetupComplete from "../adminaccountsetup/setupcomplete";
import "../designadminaccountsetup/setupwrapper.css";
import Link from "next/link";

const LEFT_PANELS = [
  {
    title: (<>Let Your Business<br />Grow Smarter</>),
    desc: "Join thousands of restaurants, cafes and shops using TableTopLeo to manage menu, orders, payments and grow their business.",
    features: [
      { icon: <MdMenuBook />, text: "Easy Menu Management" },
      { icon: <FaCreditCard />, text: "Secure Payments" },
      { icon: <FaQrcode />, text: "QR Based Ordering" },
      { icon: <FaTruck />, text: "Real-time Order Tracking" },
      { icon: <FaChartBar />, text: "Business Analytics" },
    ],
  },
  {
    title: (<>One Platform.<br />Every Business.<br />Limitless Growth.</>),
    desc: "From menu management to QR ordering and secure payments, TableTopLeo has everything you need to run and grow your business.",
    features: [
      { icon: <FaUtensils />, text: "Smart Menu Management" },
      { icon: <FaLock />, text: "Secure Payment Solutions" },
      { icon: <FaQrcode />, text: "QR Based Ordering" },
      { icon: <FaBox />, text: "Real-time Order Tracking" },
      { icon: <FaChartBar />, text: "Business Insights & Analytics" },
      { icon: <FaBuilding />, text: "Multi Business Support" },
    ],
  },
  {
    title: (<>Set Up Your Business<br />The Right Way.</>),
    desc: "Tell us about your business so we can personalize your experience and help you serve your customers better.",
    features: [
      { icon: <FaStore />, text: "All-in-One Platform", sub: "Manage menu, orders, payments and customers from one place." },
      { icon: <FaChartLine />, text: "Grow Your Business", sub: "Smart insights and tools to help you increase sales and efficiency." },
      { icon: <FaLock />, text: "Secure & Reliable", sub: "Your data and payments are always safe with us." },
      { icon: <FaBolt />, text: "Quick & Easy Setup", sub: "Get your business online in just a few simple steps." },
    ],
  },
  {
    title: (<>Your Success Starts Here,<br /><span className="panel-accent">Great Things Await!</span></>),
    desc: "From menu management to secure payments and QR ordering – TableTopLeo is your all-in-one platform to simplify operations and grow your business effortlessly.",
    features: [
      { icon: <FaStore />, text: "All-in-One Platform", sub: "Manage menu, orders, payments & customers in one place." },
      { icon: <FaChartBar />, text: "Smart Insights", sub: "Track performance and make data-driven decisions." },
      { icon: <FaQrcode />, text: "QR Based Ordering", sub: "Let your customers order effortlessly by scanning QR." },
      { icon: <FaLock />, text: "Secure & Reliable", sub: "Your data and payments are always safe with us." },
    ],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [accountData, setAccountData] = useState(null);
  const [businessTypeData, setBusinessTypeData] = useState(null);
  const [businessInfoData, setBusinessInfoData] = useState(null);

  const panel = LEFT_PANELS[step - 1];

  const goNext = () => {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="onboarding-page">
      <nav className="onboarding-nav">
        <div className="nav-logo">
          <div className="logo-icon">
            <MdTableRestaurant size={22} color="#7c3aed" />
          </div>
          <span className="logo-text">TableTopLeo</span>
        </div>
        <div className="nav-right">
          {step === 4 ? (
            <>
              <span className="nav-helper-text">Need help?</span>
              <button className="btn-contact" type="button">💬 Contact Support</button>
            </>
          ) : (
            <>
              <span className="nav-helper-text">Already have an account?</span>
              <Link href="/logintabletopleo" className="btn-login">Login</Link>
            </>
          )}
        </div>
      </nav>

      <div className="onboarding-body">
        <div className="left-panel">
          <div className="left-content">
            <h1 className="panel-title">{panel.title}</h1>
            <p className="panel-desc">{panel.desc}</p>
            <ul className="panel-features">
              {panel.features.map((f, i) => (
                <li key={i} className="panel-feature-item">
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <div>
                    <div className="feature-text">{f.text}</div>
                    {f.sub && <div className="feature-sub">{f.sub}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="left-illustration" aria-hidden="true">
            <div className="illustration-scene">
              <div className="illus-cloud illus-cloud-1" />
              <div className="illus-cloud illus-cloud-2" />
              <div className="illus-building-bg illus-bg-1" />
              <div className="illus-building-bg illus-bg-2" />
              <div className="illus-building">
                <div className="illus-awning" />
                <div className="illus-facade">
                  <div className="illus-window" />
                  <div className="illus-window" />
                  <div className="illus-door">
                    <span className="illus-sign">TableTopLeo</span>
                  </div>
                </div>
              </div>
              <div className="illus-table-wrap">
                <div className="illus-table" />
                <div className="illus-chair illus-chair-left" />
                <div className="illus-chair illus-chair-right" />
              </div>
              <div className="illus-plant illus-plant-left">🌿</div>
              <div className="illus-plant illus-plant-right">🌿</div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-card">
            {step > 1 && <Stepper currentStep={step} />}
            <div className="form-body">
              {step === 1 && (
                <AccountSetup
                  onNext={(data) => { setAccountData(data); goNext(); }}
                  initialData={accountData}
                />
              )}
              {step === 2 && (
                <BusinessType
                  onNext={(data) => { setBusinessTypeData(data); goNext(); }}
                  onBack={goBack}
                  initialData={businessTypeData}
                />
              )}
              {step === 3 && (
                <BusinessInformation
                  onNext={(data) => { setBusinessInfoData(data); goNext(); }}
                  onBack={goBack}
                  initialData={businessInfoData}
                  businessTypeData={businessTypeData}
                  accountData={accountData}
                />
              )}
              {step === 4 && (
                <SetupComplete
                  accountData={accountData}
                  businessTypeData={businessTypeData}
                  businessInfoData={businessInfoData}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}