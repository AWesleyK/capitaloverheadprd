import React, { useEffect } from 'react';
import styles from './RecentProjects.module.scss'

const RecentProjects = () => {

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://app.realworklabs.com/static/plugin/loader.js?v=' + new Date().getTime();
        script.async = true;
    
        script.onload = () => {
          window.addEventListener('rwlPluginReady', () => {
            window.rwlPlugin.init('https://app.realworklabs.com', 'EgasJIOpJO7pyX45');
          }, false);
        };
    
        document.body.appendChild(script);
    
        return () => {
          document.body.removeChild(script);
        };
      }, []);
    
      return (
        <div className={styles.container}>
          <div className={styles.h1Container}>
          <h1>Recent Projects</h1>
          </div>
          <div id="rwl-output"></div>
        </div>
      );
}

export default RecentProjects;
