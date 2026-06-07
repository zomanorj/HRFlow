from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField(read_only=True)
    employee_id = serializers.IntegerField(source='employee.id', read_only=True)

    class Meta:
        model = Attendance
        fields = ('id', 'employee_id', 'employee_name', 'date', 'check_in', 'check_out', 'hours_worked')
        read_only_fields = ('id', 'employee_id', 'date', 'check_in', 'hours_worked')

    def get_employee_name(self, obj):
        return f"{obj.employee.prenom} {obj.employee.nom}"
