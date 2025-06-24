from flask import Blueprint, jsonify, current_app
import os
admin_images_bp = Blueprint('admin_images_bp', __name__)

# Prikazuje velicine slika svih usera 
@admin_images_bp.route('/images-size', methods=['GET'])
def get_images_usage():
    images_folder = current_app.config.get('IMAGES_UPLOAD_FOLDER', './static/uploads')
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(images_folder):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # Ignoriši simboličke linkove ako ih ima
            if os.path.islink(fp):
                continue
            total_size += os.path.getsize(fp)
    size_mb = total_size / (1024 * 1024)
    return jsonify({
        'folder': images_folder,
        'size_bytes': total_size,
        'size_mb': round(size_mb, 2)
    })
