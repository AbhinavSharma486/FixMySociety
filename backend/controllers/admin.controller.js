
import Complaint from "../models/complaint.model.js";
import Admin from "../models/admin.model.js";


// Get all complaints across all buildings (Admin only)
export const getAllComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'fullName email flatNumber')
      .populate('buildingName', 'buildingName')
      .select('title description user buildingName flatNumber category likes status images video createdAt') // Explicitly select video field
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.log("Error in getAllComplaintsAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Complaint by ID (Admin only)
// Complaint ko ID ke basis pe nikalne ke liye controller function
export const getComplaintByIdAdmin = async (req, res) => {
  try {
    // 1. URL params se complaint ka id nikal liya
    const { id } = req.params;

    // 2. Complaint ko DB se find karo aur related data ko populate karo
    const complaint = await Complaint.findById(id)
      // Complaint banane wale user ka detail lao (sirf ye fields)
      .populate('user', 'fullName email flatNumber')
      // Complaint jis building se belong karti hai uska naam lao
      .populate('buildingName', 'buildingName')
      // Har comment ka user ka detail lao
      .populate("comments.user", "fullName profilePic flatNumber")
      // Har reply ka user ka detail lao
      .populate("comments.replies.user", "fullName profilePic flatNumber")
      // Sirf selected fields complaint ke laane hain
      .select('title description user buildingName flatNumber category likes status images video createdAt');

    // 3. Agar complaint exist hi nahi karti toh 404 return karo
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // 4. Admin ke comments/replies ke user info ko manually attach karna padega
    // (kyunki populate normally User model se karta hai, Admin se nahi)
    const adminIdsToFetch = new Set(); // duplicate IDs avoid karne ke liye Set use kiya

    // 5. Complaint ke comments loop karo
    complaint.comments.forEach(c => {
      // Agar comment admin ka hai aur user ka detail populate nahi hua
      if (c.authorRole === 'admin' && c.user && !c.user.fullName) {
        // To admin ka ID save kar lo future fetch ke liye
        adminIdsToFetch.add(String(c.user));
      }

      // Agar replies bhi hai comment ke andar
      if (c.replies && c.replies.length) {
        // Har reply loop karo aur admin check karo
        c.replies.forEach(r => {
          if (r.authorRole === 'admin' && r.user && !r.user.fullName) {
            // Agar reply bhi admin ka hai aur detail nahi mila
            adminIdsToFetch.add(String(r.user));
          }
        });
      }
    });

    // 6. Agar kuch admin IDs collect hue hai
    if (adminIdsToFetch.size > 0) {
      // Un IDs ke admins ka detail Admin collection se nikal lo
      const admins = await Admin.find({ _id: { $in: Array.from(adminIdsToFetch) } })
        .select('fullName profilePic'); // Sirf fullName aur profilePic chahiye

      // Admins ka ek map bana lo (quick lookup ke liye)
      const adminMap = new Map(admins.map(a => [String(a._id), a]));

      // 7. Ab dobara comments loop karo aur admin ka detail set karo
      complaint.comments.forEach(c => {
        // Agar comment admin ka hai aur abhi tak user ka detail nahi hai
        if (c.authorRole === 'admin' && c.user && !c.user.fullName) {
          const adm = adminMap.get(String(c.user));

          if (adm) {
            // Comment ke user field ko manually admin ka detail assign kar do
            c.user = { _id: adm._id, fullName: adm.fullName, profilePic: adm.profilePic };
          }
        }

        // Replies me bhi same process karo
        if (c.replies && c.replies.length) {
          c.replies.forEach(r => {
            if (r.authorRole === 'admin' && r.user && !r.user.fullName) {
              const adm = adminMap.get(String(r.user));

              if (adm) {
                // Reply ke user field ko manually admin ka detail assign kar do
                r.user = { _id: adm._id, fullName: adm.fullName, profilePic: adm.profilePic };
              }
            }
          });
        }
      });
    }

    // 8. Final response bhej do (complaint ke saath user/admin detail attach karke)
    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    // 9. Agar upar kahi error aaya toh catch block chalega
    console.log("Error in getComplaintByIdAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
