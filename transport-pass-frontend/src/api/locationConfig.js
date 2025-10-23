export const locationConfig = {
  Bus: [
    "CMBT (Koyambedu)", "T Nagar", "Guindy", "Tambaram", "Velachery",
    "Saidapet", "Moolakadai", "Porur", "Anna Nagar", "Pallavaram",
    "Chromepet", "Chennai Central", "Adyar", "Sholinganallur", "Thiruvanmiyur"
  ],
  Train: [
    "Chennai Central", "Egmore", "Tambaram", "Avadi", "Mambalam",
    "Perambur", "Park Town", "Chromepet", "Guindy", "St. Thomas Mount"
  ],
  Metro: [
    "Airport", "Alandur", "Ashok Nagar", "Central", "Guindy",
    "Saidapet", "Vadapalani", "High Court", "Thirumangalam", "Washermanpet"
  ]
};

export const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));


