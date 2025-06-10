// permission admin, su, user

export const role = (...roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Tidak cukup akses' });
      }
      next();
    };
  };
  
  export default role;