import React, { useEffect, useState } from 'react';
import { TextEncoder as FastTextEncoder } from 'fastestsmallesttextencoderdecoder';
const encoder = window.TextEncoder ? new TextEncoder() : new FastTextEncoder();

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  iframe: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
};

const IFrame = ({ content }) => {
  return (
    <div style={styles.container}>
      <iframe style={styles.iframe} src={content} />
    </div>
  );
};

export const MSOfficeViewer = ({ content }) => <IFrame content={`https://view.officeapps.live.com/op/embed.aspx?src=${content}`} />

export const GoogleDocsViewer = ({ content }) => <IFrame content={`https://docs.google.com/gview?url=${content}`} />

export const WebPageViewer = ({ content }) => {
  const [src, setSrc] = useState();
  
  useEffect(() => {
    if (src) {
      window.URL.revokeObjectURL(src);
    }
    const blob = new Blob([encoder.encode(content)]);
    const url = window.URL.createObjectURL(blob);
    setSrc(url);
    return () => window.URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div style={styles.container}>
      <iframe style={styles.iframe} srcDoc={content} src={src} />
    </div>
  );
};

export default IFrame;
