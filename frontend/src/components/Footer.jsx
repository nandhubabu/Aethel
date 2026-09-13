import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top
        </button>
      </div>
      
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>Get to Know Us</h3>
              <ul>
                <li><Link to="#">About Us</Link></li>
                <li><Link to="#">Careers</Link></li>
                <li><Link to="#">Press Releases</Link></li>
                <li><Link to="#">Aethel Science</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Connect with Us</h3>
              <ul>
                <li><Link to="#">Facebook</Link></li>
                <li><Link to="#">Twitter</Link></li>
                <li><Link to="#">Instagram</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Make Money with Us</h3>
              <ul>
                <li><Link to="/register">Sell on Aethel</Link></li>
                <li><Link to="#">Sell under Aethel Accelerator</Link></li>
                <li><Link to="#">Protect and Build Your Brand</Link></li>
                <li><Link to="#">Aethel Global Selling</Link></li>
                <li><Link to="#">Become an Affiliate</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Let Us Help You</h3>
              <ul>
                <li><Link to="#">COVID-19 and Aethel</Link></li>
                <li><Link to="/profile">Your Account</Link></li>
                <li><Link to="#">Returns Centre</Link></li>
                <li><Link to="#">100% Purchase Protection</Link></li>
                <li><Link to="#">Aethel App Download</Link></li>
                <li><Link to="#">Help</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="footer-logo">Aethel</div>
            <div className="footer-settings">
              <button className="footer-btn">English</button>
              <button className="footer-btn">India</button>
            </div>
          </div>
          <div className="footer-legal">
            <ul>
              <li><Link to="#">Conditions of Use & Sale</Link></li>
              <li><Link to="#">Privacy Notice</Link></li>
              <li><Link to="#">Interest-Based Ads</Link></li>
            </ul>
            <p>&copy; {new Date().getFullYear()} Aethel.in, Inc. or its affiliates</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
