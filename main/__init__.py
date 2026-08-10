

import pymysql

# 1. Install as MySQLdb replacement
pymysql.install_as_MySQLdb()

# 2. Spoof the version to satisfy Django's requirement
pymysql.version_info = (2, 2, 1, "final", 0)