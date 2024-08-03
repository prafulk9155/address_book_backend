const db = require("../config/db");



const add_contact = async (req, res) => {
  const {
    full_name,
    email,
    contact_number,
    dob,
    website,
    group,
    profile_description, // Additional field for profile
    profile_picture, // Additional field for profile
  } = req.body.data;

if(contact_number && (contact_number))  

  try {
    // Step 1: Insert the contact into the contacts table
    const sqlInsertContact = `INSERT INTO contacts (name, email, phone, dob, website, group_name) VALUES (?, ?, ?, ?, ?, ?)`;

    const [contactResult] = await db.query(sqlInsertContact, [
      full_name,
      email,
      contact_number,
      dob,
      website,
      group,
    ]);

    // Step 2: Insert the profile into the profiles table using the newly created contact_id
    const sqlInsertProfile = `INSERT INTO profiles (contact_id, profile_description, profile_picture) VALUES (?, ?, ?)`;

    await db.query(sqlInsertProfile, [
      contactResult.insertId,
      profile_description,
      profile_picture,
    ]);

    res.status(201).json({
      error: false,
      message: "Contact and profile added successfully",
      userId: contactResult.insertId,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const update_contact = async (req, res) => {
  const {
    id, // ID of the contact to be updated
    full_name,
    email,
    contact_number,
    dob,
    website,
    group,
    profile_description,
    profile_picture,
    profile_id,
  } = req.body.data;

  try {
    // Step 1: Update the contact in the contacts table
    const sqlUpdateContact = `UPDATE contacts SET name = ?, email = ?, phone = ?, dob = ?, website = ?, group_name = ? WHERE id = ?`;

    await db.query(sqlUpdateContact, [
      full_name,
      email,
      contact_number,
      dob,
      website,
      group,
      id,
    ]);

    res.status(200).json({
      error: false,
      message: "Contact updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const get_list = async (req, res) => {
    const { start, count, sortBy, sortOrder, filters, searchText, contact_number } = req.body.data; // Extract additional params from the payload
  
    const offset = parseInt(start);
    const limit = parseInt(count);
  
    if (isNaN(offset) || isNaN(limit) || limit < 0 || offset < 0) {
      return res.status(400).json({
        error: true,
        message: "Invalid start or count values. They must be non-negative integers.",
      });
    }
  
    // Validate contact_number if provided
    if (contact_number && !/^\+?\d*$/.test(contact_number)) {
      return res.status(400).json({
        error: true,
        message: "Invalid contact number. Only numbers and a '+' at the start are allowed.",
      });
    }
  
    // Prepare SQL query with dynamic sorting and filtering
    let sql = `SELECT SQL_CALC_FOUND_ROWS id, name, group_name, email, phone, website, dob FROM contacts WHERE is_active=1 `;
    const queryParams = [];
  
    // Search logic
    if (searchText) {
      sql += `AND (name LIKE ? OR email LIKE ? OR phone LIKE ?) `;
      const searchTerm = `%${searchText}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm); // Add the search term to the parameters
    }
  
    // Filter logic
    if (filters) {
      if (filters.name) {
        sql += `AND name LIKE ? `;
        queryParams.push(`%${filters.name}%`);
      }
      if (filters.group_name) {
        sql += `AND group_name LIKE ? `;
        queryParams.push(`%${filters.group_name}%`);
      }
      
      // Check for contact number filter
      if (contact_number) {
        sql += `AND phone LIKE ? `;
        queryParams.push(`%${contact_number}%`); // Add contact number to the query
      }
    }
  
    // Sorting logic
    if (sortBy) {
      const order = sortOrder === "desc" ? "DESC" : "ASC"; // Default to ascending if not provided
      sql += `ORDER BY ${sortBy} ${order} `;
    }
  
    sql += `LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
  
    try {
      const [rows] = await db.query(sql, queryParams);
  
      const total_count_query = "SELECT FOUND_ROWS() as total";
      const [[total]] = await db.query(total_count_query);
  
      const formattedContacts = rows.map((contact) => ({
        ...contact,
        dob: formatDate(contact.dob),
      }));
  
      res.status(200).json({
        error: false,
        message: "Contacts fetched successfully",
        contacts: formattedContacts,
        total: total.total || 0,
      });
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  };
  
const get_group_type = async (req, res) => {
  const sql = `SELECT DISTINCT group_name FROM contacts WHERE is_active=1`; // SQL to select distinct group names

  try {
    const [rows] = await db.query(sql); // Execute the query without queryParams

    // Construct the response with the fetched group names
    res.status(200).json({
      error: false,
      message: "Group fetched successfully",
      groups: rows, // Renamed variable for clarity
    });
  } catch (error) {
    console.error("Error fetching group types:", error); // Log the error for debugging
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const get_data_by_id = async (req, res) => {
  const { id } = req.body.data; // Assuming id comes from the URL as a route parameter

  const parsedId = parseInt(id);

  if (isNaN(parsedId)) {
    return res.status(400).json({
      error: true,
      message: "Invalid User ID",
    });
  }

  try {
    // SQL query to fetch the contact by ID
    const sql = `SELECT id, name, group_name, email, phone, website, dob FROM contacts WHERE id = ?`;
    const [rows] = await db.query(sql, [parsedId]);

    // If no contact is found, return a 404 response
    if (rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Contact not found",
      });
    }

    // Send the response with fetched contact
    res.status(200).json({
      error: false,
      message: "Contact fetched successfully",
      contact: rows[0], // Send the first row as contact
    });
  } catch (error) {
    console.error("Error fetching data by ID:", error);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// const in_active_contact = async (req, res) => {
//   const { id } = req.body.data;

//   try {
//     // Step 1: Update the contact in the contacts table
//     // const sqlUpdateContact = `UPDATE contacts SET is_active = ? WHERE id = ?`;
//      const sqlUpdateContact = `DELETE FROM contacts WHERE id = ?;`;


//     await db.query(sqlUpdateContact, [0, id]);

//     res.status(200).json({
//       error: false,
//       message: "Contact deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: true,
//       message: error.message,
//     });
//   }
// };

const in_active_contact = async (req, res) => {
  const { id } = req.body.data;

  try {
    // Step 1: Delete related records in the profiles table
    const sqlDeleteProfiles = `DELETE FROM profiles WHERE contact_id = ?;`;
    await db.query(sqlDeleteProfiles, [id]);

    // Step 2: Delete the contact from the contacts table
    const sqlDeleteContact = `DELETE FROM contacts WHERE id = ?;`;
    await db.query(sqlDeleteContact, [id]);

    res.status(200).json({
      error: false,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};


const formatDate = (isoString) => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

module.exports = {
  add_contact,
  get_list,
  update_contact,
  get_data_by_id,
  in_active_contact,
  get_group_type,
};
