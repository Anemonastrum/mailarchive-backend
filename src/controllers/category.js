import Category from "../models/category.js";

// buat kategori, dayum cuma nama doang
export const createCategory = async (req, res) => {
  
    const { name } = req.body;

    try {
        const exist = await Category.findOne({ name });
        if (exist) return res.status(400).json({ message: 'sudah ada' });

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ message: 'ok', category });
        
    } catch (err) {
        res.status(500).json({message: 'Server Error', err});
    }
};

// update kategori lewat id
export const updateCategory = async (req, res) => {

    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await Category.findById(id);
        if (!category) return res.status(400).json({ msg: 'kategori salah atau tidak ada' });

        if (name) category.name = name;

        await category.save();
        res.json({ message: 'ok', category});
    } catch (err) {
        res.status(500).json({message: 'Server Error', err});
    }
};

// get kategori
export const getCategory = async (req, res) => {
  try {
    const category = await Category.find();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    
    res.status(500).json({ message: 'Server Error', err });
  }
};


// delet kateori
export const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      // verif data inbox
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'data tidak ditemukan' });
  
      await category.deleteOne();
  
      res.json({ message: 'ok' });
  
    } catch (err) {
      res.status(500).json({ message: 'Server Error', err });
    }
};