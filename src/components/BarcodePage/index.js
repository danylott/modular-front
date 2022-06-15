import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  Barcode, BarcodePicker, configure, ScanSettings, Scanner
} from 'scandit-sdk';

import CheckAdmin from '../CheckAdmin';

export default function BarcodePage() {
  const [data, setData] = useState('');
  const [soloImageData, setSoloImageData] = useState([]);

  useEffect(() => {
    configure(process.env.REACT_APP_SCANDIT_KEY, {
      engineLocation: 'https://cdn.jsdelivr.net/npm/scandit-sdk/build',
    }).then(() => {
      BarcodePicker.create(document.getElementById('scandit-barcode-picker'), {
        playSoundOnScan: true,
      }).then((barcodePicker) => {
        barcodePicker.applyScanSettings(
          new ScanSettings({
            enabledSymbologies: [
              Barcode.Symbology.EAN8,
              Barcode.Symbology.EAN13,
              Barcode.Symbology.UPCA,
              Barcode.Symbology.UPCE,
              Barcode.Symbology.CODE128,
              Barcode.Symbology.CODE39,
              Barcode.Symbology.CODE93,
              Barcode.Symbology.INTERLEAVED_2_OF_5,
            ],
            codeDuplicateFilter: 600,
          }),
        );

        barcodePicker.on('scan', (scanResult) => {
          const barcode = scanResult.barcodes[0];
          setData(
            (resp) => `${Barcode.Symbology.toHumanizedName(barcode.symbology)
            }: ${
              barcode.data
            }\n\r${
              resp}`,
          );
        });
      });
    });


    configure(process.env.REACT_APP_SCANDIT_KEY, {
      engineLocation: 'https://cdn.jsdelivr.net/npm/scandit-sdk/build',
    }).then(() => {
      const scanner = new Scanner();
      scanner.applyScanSettings(new ScanSettings({
        enabledSymbologies: [
          Barcode.Symbology.EAN8,
          Barcode.Symbology.EAN13,
          Barcode.Symbology.UPCA,
          Barcode.Symbology.UPCE,
          Barcode.Symbology.CODE128,
          Barcode.Symbology.CODE39,
          Barcode.Symbology.CODE93,
        ]
      }));
      scanner.applyImageSettings({
        format: 2,
        width: 956,
        height: 1276,
      });
      document.getElementById('button').onclick = function(evt) {
        scanner.applyImageSettings({
          format: 2,
          width: document.getElementById('output').naturalWidth,
          height: document.getElementById('output').naturalHeight,
        });
        scanner.processImage(document.getElementById('output'), true)
        .then((result) => {
          setSoloImageData(JSON.stringify(result.barcodes, ['symbology', 'data']));
        });
      }  
    })
  
    document.getElementById('image').onchange = function (evt) {
      var tgt = evt.target || window.event.srcElement,
          files = tgt.files;
  
      // FileReader support
      if (FileReader && files && files.length) {
          var fr = new FileReader();
          fr.onload = function () {
              document.getElementById('output').src = fr.result;
          }
          fr.readAsDataURL(files[0]);
      }
  
      // Not supported
      else {
          // fallback -- perhaps submit the input to an iframe and temporarily store
          // them on the server until the user's session ends.
      }
    }
  

    return () => {};
  }, []);


  return (
    <Row style={{ flexFlow: 'row' }}>
      <CheckAdmin />
      <Col>
        <div id="scandit-barcode-picker" />
        <input type="file" id="image" name="myImage" accept="image/*" />
        <img width="300" id="output" />
        <button id="button">Click</button>
        <pre>{soloImageData}</pre>
      </Col>
      <Col>
        <div style={{ marginTop: '20px', width: '400px' }}>
          <pre>{data}</pre>
        </div>
      </Col>
    </Row>
  );
}
