exports.config = () => {
  return {
    // Core bot configuration
    bot: {
      color: 'e6e7e9' // Bot theme color (hex)
    },
    // Configuration for Google Sheets parsing
    sheets: {
      key: '1AddRvGWJ_f4B6UC7_IftDiVudVc8CJ8sxLUqlxVsCz4', // Key of the Google Sheets document
      indexes: [
        'Seller',
        'Case',
        'Brand',
        'Model',
        'Cooler',
        'Name',
        'Chipset_INDEX', // part of hacky mobo index fix
        'GPU'
      ], // The columns in which information will be indexed
      metadata: {
        // Configure the sheets that are to be downloaded and indexed
        'SFF Case <10L': {
          category: 'Cases' // Category of the component
        }, // Repeat as needed
        'SFF Case 10L-20L': {
          category: 'Cases'
        },
        'MFF Case >20L': {
          category: 'Cases'
        },
        'CPU Cooler <70mm': {
          category: 'Coolers (Air)'
        },
        AIO: {
          category: 'Coolers (AIO)'
        },
        'Slim Fan': {
          category: 'Slim Fans'
        },
        'mITX Boards': {
          category: 'Mobos (ITX)' // if change, need to change sheets.js hardcoded mobo fix
        }
        // 'SFF GPU <215mm': {
        //   category: 'GPUs'
        // },
        // 'GPU >215mm': {
        //   category: 'GPUs'
        // }
      },
      brandTitles: ['Seller', 'Brand'],
      modelTitles: ['Case', 'Cooler', 'Model', 'Name'],
      formatting: {
        // Configure message formatting by category
        Cases: {
          title: '{{Seller}} {{Case}}',
          desc:
            '**Volume**: {{Volume (L)}}L [{{Case Length (mm)}} × {{Case Width (mm)}} × {{Case Height (mm)}}mm]\n' +
            '**Style**: {{Style}}\n' +
            '**Motherboard**: {{Motherboard}}\n' +
            '**CPU Cooler**:\n' +
            '<:blank:858431977011281921> Clearance: {{CPU Cooler Height (mm)}}mm\n' +
            '<:blank:858431977011281921> AIO Support: {{AIO / Radiator Support}}\n' +
            '**GPU Support**:\n' +
            '<:blank:858431977011281921> Thickness: {{GPU Height / Thickness (mm)}}mm / {{PCIe Slot}} slot(s)\n' +
            '<:blank:858431977011281921> L×W: {{GPU Length (mm)}} × {{GPU Width (mm)}}mm\n' +
            '**PSU Support**: {{PSU}}\n' +
            '**Price (USD)**: ${{Price (USD)}}'
        },
        'Coolers (AIO)': {
          title: '{{Brand}} {{Model}}',
          desc:
            '**Type**: {{Radiator Type}}mm\n' +
            '**Radiator**:\n' +
            '<:blank:858431977011281921> Dimensions: {{Radiator Length (mm)}}×{{Radiator Width (mm)}}×{{Radiator Thickness (mm)}}mm\n' +
            '<:blank:858431977011281921> Material: {{Radiator Material}}\n' +
            '**Fans**:\n' +
            '<:blank:858431977011281921> Count: {{Fans}} fan(s)\n' +
            '<:blank:858431977011281921> Size: {{Fan Size (mm)}}mm\n' +
            '<:blank:858431977011281921> Max Noise: {{Fan Noise (dB(A))}} dB(A)\n' +
            '**Pump**:\n' +
            '<:blank:858431977011281921> Speed: {{Pump Speed (rpm)}} RPM\n' +
            '<:blank:858431977011281921> Height: {{Pump Height (mm)}}mm'
        },
        'Coolers (Air)': {
          title: '{{Brand}} {{Cooler}}',
          desc:
            '**Height**: {{Height (mm)}}mm\n' +
            '**L × W**: {{Length (mm)}} × {{Width (mm)}}mm\n' +
            '**Fans**:\n' +
            '<:blank:858431977011281921> Count: {{Fans}} fan(s)\n' +
            '<:blank:858431977011281921> Size: {{Fan Size (mm)}}mm\n' +
            '<:blank:858431977011281921> Speed: {{Max Fan Speed (RPM)}} RPM\n' +
            '<:blank:858431977011281921> Airflow/SP: {{Max Air Flow (CFM)}} CFM / {{Max Static Pressure (mmH2O)}} mmH20\n' +
            '<:blank:858431977011281921> Max Noise: {{Max Noise (dB(A))}} dB(A)\n' +
            '**Heatsink**:\n' +
            '<:blank:858431977011281921> Material: {{Heatsink Material}}\n' +
            '<:blank:858431977011281921> Heatpipes: {{Heatpipes}}\n' +
            '**RAM Clearance**: {{RAM Clearance (mm)}} (mm)'
        },
        'Slim Fans': {
          title: '{{Brand}} {{Model}}',
          desc:
            '**Size**: {{Fan Size (mm)}}x{{Thickness (mm)}}mm\n' +
            '**Max Speed**: {{Max Fan Speed (rpm)}} RPM\n' +
            '**Airflow/SP**: {{Max Air Flow (CFM)}} CFM / {{Max Static Pressure (mmH2O)}} mmH20\n' +
            '**Max Noise**: {{Max Noise (dB(A))}} dB(A)\n' +
            '**PWM / DC**: {{PWM / DC}}'
        },
        'Mobos (ITX)': {
          title: '{{Brand}} {{Name}}',
          desc:
            '**Socket/Chipset**: {{CPU}} {{Socket}} - {{Chipset}}\n' +
            '**CPU OC**: {{CPU Overclock}}\n' +
            '**RAM OC**: {{RAM Overclock}}\n' +
            '**RAM Support**: {{RAM Slots}} Slots - {{Supported RAM Capacity (GB)}}GB {{RAM Type}} - {{Supported Memory Speed (MT/s)}} MHz\n' +
            '**Connectivity**:\n' +
            '<:blank:858431977011281921> USB Ports: {{Total USB Ports}}\n' +
            '<:blank:858431977011281921> USB-C Header: {{USB-C Header}}\n' +
            '<:blank:858431977011281921> LAN: {{LAN Speed (Gbps)}}G {{LAN Controller}}\n' +
            '<:blank:858431977011281921> Wi-Fi: {{Wi-Fi Module}}\n' +
            '<:blank:858431977011281921> Bluetooth: {{Bluetooth}}\n' +
            '<:blank:858431977011281921> M.2 SSD Slots: {{M.2 (Key-M) NVMe/SATA SSD Slot\nGreen=Front\nRed=Back}}\n' +
            '<:blank:858431977011281921> SATA Ports: {{SATA 3.0 Ports}}\n' +
            '**PCIe Gen**: {{PCIe Gen}}\n' +
            '**Bifurcation**: {{Bifurcation Support}}\n' +
            '**Notes**: {{Remarks}}'
        }
      }
    }
  }
}
