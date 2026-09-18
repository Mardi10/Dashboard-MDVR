# Sistem Pelaporan MDVR Unit

> Integrated Web-Based MDVR Unit Reporting, Database Monitoring, Data Processing & Visualization System

## Overview

"Sistem Pelaporan MDVR Unit" adalah sistem terintegrasi yang dirancang untuk mempermudah proses pelaporan, monitoring, pengolahan, dan visualisasi data MDVR Unit dalam satu alur kerja digital.

Sistem ini menghubungkan "Website sebagai media input", "Database Website sebagai monitoring data", "Google Spreadsheet sebagai database utama sekaligus data processing", dan "Looker Studio sebagai platform visualisasi dan dashboard".

Dengan sistem ini, data yang awalnya berupa "data mentah dari laporan unit" dapat secara otomatis diteruskan ke database utama, diproses menjadi data siap analisis, kemudian divisualisasikan dalam dashboard.

---

# System Architecture

Sistem terdiri dari beberapa komponen yang saling terhubung:

                    ┌──────────────────────┐
                    │     ADMIN MDVR /     │
                    │                      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      WEB INPUT       │
                    │  Pelaporan MDVR Unit │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   DATABASE WEBSITE   │
                    │      MONITORING       │
                    └──────────┬───────────┘
                               │
                               │ Automatic Sync
                               ▼
              ┌──────────────────────────────────┐
              │       GOOGLE SPREADSHEET         │
              │          DATABASE UTAMA          │
              │                                  │
              │  Raw Data → Processing → Ready   │
              │              for Analysis        │
              └────────────────┬─────────────────┘
                               │
                               │ Data Connection
                               ▼
                    ┌──────────────────────┐
                    │    LOOKER STUDIO     │
                    │   DATA VISUALIZATION │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      DASHBOARD       │
                    │   & DATA ANALYSIS    │
                    └──────────────────────┘


##Penjelasan Lampiran
 - index.html & code.gs adalah source code pada Web MDVR ini
 - Sistem Input.PNG adalah Screenshoot tampilan Web-Inputan MDVR
 - Database Web.PNG adalah Screenshoot tampilan database web (Database untuk menampilkan data di database utama yaitu spreedsheet)
 - Database Spreedsheet.PNG adalah Screenshoot tampilan database utama (Data Mentah)
 - DASHBOARD MDVR.pdf adalah lampiran Dashboard yang sudah saya rancang berdasarkan kebutuhan perusahaan. Terdapat beberapa Menu:
   + Menu Dashboard adalah menu utama keseluruhan data yang di visualisasi.
   + Menu Daily Shift I adalah menu untuk laporan Daily Shift I. Menu Daily Shift II adalah menu untuk laporan Daily Shift II.
   + Menu Dashboard PIT TAS adalah menu untuk menampilkan data pada PIT TAS (Kebutuhan Weekly PIT TAS).
   + Menu Dashboard PIT FSP adalah menu untuk menampilkan data pada PIT FSP (Kebutuhan Weekly PIT FSP).
   + Menu Dashboard PIT BT adalah menu untuk menampilkan data pada PIT BT (Kebutuhan Weekly PIT BT).
   + Menu Dashboard Lainnya adalah menu untuk menampilkan data pada PIT Lainnya (Unit Support/Sarana di Luar PIT).
