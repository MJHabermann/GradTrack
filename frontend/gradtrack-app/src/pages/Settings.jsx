import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Layout from '../components/layout/Layout';
import './Settings.css';

const Settings = () => {
  return (
    <Layout>
      <main className="settings-container">
        <h2>Settings</h2>

        <section className="settings-section">
          <h3>Profile</h3>
          <label>
            Name:
            <input type="text" placeholder="Mikayla" />
          </label>
          <label>
            Email:
            <input type="email" placeholder="you@example.com" />
          </label>
        </section>

        <section className="settings-section">
          <h3>Preferences</h3>
          <label>
            Notification Emails:
            <select>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </label>
          <label>
            Dashboard Theme:
            <select>
              <option>Soft Academic</option>
              <option>Dark Mode</option>
              <option>Minimal</option>
            </select>
          </label>
        </section>

        <section className="settings-section">
          <h3>Account</h3>
          <button className="danger-btn">Delete Account</button>
        </section>
      </main>
    </Layout>
  );
};

export default Settings;
