import React from 'react';

const DonationDisclaimer = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Donation Disclaimer</h1>
      <p className="mb-4">Effective Date: June 2025</p>

      <p className="mb-4">
        Path Sarthi Trust is registered and operates as a charitable, non-profit organization. All donations received are used solely for the purposes of education, upliftment, and support of underprivileged communities.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Transparency</h2>
      <p className="mb-4">
        We strive to maintain transparency and accountability in how funds are allocated. Donors can request general reports on how donations are utilized.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Tax Exemption</h2>
      <p className="mb-4">
        Donations made are currently <strong>not eligible for tax exemption</strong> under Section 80G of the Income Tax Act. We are in the process of applying for eligibility.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. No Goods or Services</h2>
      <p className="mb-4">
        Donors will not receive any goods or services in exchange for their contributions, in accordance with standard charitable guidelines.
      </p>

      <p>
        Questions? Email us at: <strong>pathsarthitrust@gmail.com</strong>
      </p>
    </div>
  );
};

export default DonationDisclaimer; 