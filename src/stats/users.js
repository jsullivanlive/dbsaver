async function users(keyPrefix, conn, storage) {
  const goodIcon = "noun_Ok_108699.png";
  const badIcon = "noun_Close_316878.png";

  const newUsers = await conn
    .sobject("User")
    .select("*")
    .where("CreatedDate >= last_n_days:7")
    .execute();

  const adminChanges = await conn
    .sobject("User")
    .select("*")
    .where(
      "SystemModstamp >= last_n_days:7 and Profile.Name like '%administrator%'"
    )
    .execute();

  const profilesChanged = await conn
    .sobject("Profile")
    .select("*")
    .where("SystemModstamp >= last_n_days:7")
    .execute();

  // TODO check user changes over the last 7 days
  // TODO show the users created
  // TODO show admin changes especially
  // TODO show changes to people with modify all data access
  // TODO show license utilization

  const statusImage = goodIcon;
  return {
    ok: true,
    html: `
        <div>
          <h3><img src="https://app.dbsaver.com/public/${statusImage}"/>User Changes</h3>
          <h3>New Users</h3>
          ${
            newUsers.length
              ? newUsers.map(u => `<div>${u => u.Username}</div>`).join("")
              : "No new users created recently"
          }
          <h3>Recent Admin Changes</h3>
          ${
            adminChanges.length
              ? adminChanges.map(u => `<div>${u.Username}</div>`).join("")
              : "No recent admin changes"
          }
          <h3>Profiles Changed</h3>
          ${profilesChanged.map(u => `<div>${u.Username}</div>`).join("") ||
            "No recent admin changes"}
        </div>
      `
  };
}

module.exports = users;
