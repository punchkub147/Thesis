      db.collection('working').add({
        employee_id: data.employee_id,
        work_id: snapshot.id,
        total_piece: work.piece*data.pack,
        worktime: work.worktime,
        price: work.price,
        work_name: work.name,
        startAt: work.startAt,
        endAt: work.endAt,
      })